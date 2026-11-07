// RECO preorders: a non-binding, refundable deposit taken through Stripe's hosted Checkout, so card details never reach this server.
// Stripe's webhook is what records an order; the browser's return to the thanks page proves nothing.
// Preorders stay off, and the site offers only the waitlist, until both of these are set:
//   STRIPE_SECRET_KEY      from the Stripe dashboard (sk_test_... to rehearse, sk_live_... for real)
//   STRIPE_WEBHOOK_SECRET  the signing secret of the webhook pointed at WEBHOOK_PATH
// Also set SITE_URL in production (https://recotape.co), where Stripe sends buyers back to.

const fs = require('fs');
const path = require('path');

const WEBHOOK_PATH = '/api/stripe/webhook';
const DEPOSIT_CENTS = 4900;
const EXPECTED_PRICE = '$150';
const EXPECTED_SHIP = '6 to 12 months';
const REFUND_AFTER_MONTHS = 12;       // we promise to refund any preorder that hasn't shipped by then
const CURRENCY = 'usd';
const ORDER_KIND = 'reco-preorder';   // the Stripe account may sell other things; only these are ours
const CONTACT_EMAIL = 'recowearable@gmail.com';
const MAX_SOURCE = 40;

const dollars = cents => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

function readConfig(env) {
  return { enabled: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET), depositCents: DEPOSIT_CENTS, expectedPrice: EXPECTED_PRICE, expectedShip: EXPECTED_SHIP, refundAfterMonths: REFUND_AFTER_MONTHS };
}

function refundByDate(orderedAt) {
  const by = new Date(orderedAt);
  by.setUTCMonth(by.getUTCMonth() + REFUND_AFTER_MONTHS);
  return by;
}

function siteUrl(env) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, '');
  return env.VERCEL_URL ? `https://${env.VERCEL_URL}` : `http://localhost:${env.PORT || 3000}`;
}

/* Postgres when a pool is given, otherwise a local JSON file for development */
function createPreorderStore({ pool, file }) {
  if (pool) {
    return {
      async init() {
        await pool.query(`CREATE TABLE IF NOT EXISTS preorders (
          id SERIAL PRIMARY KEY,
          stripe_session_id TEXT UNIQUE NOT NULL,
          stripe_payment_intent TEXT,
          email TEXT NOT NULL,
          name TEXT,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'paid',
          source TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          refunded_at TIMESTAMPTZ
        )`);
      },
      async record(o) {
        const r = await pool.query(
          `INSERT INTO preorders (stripe_session_id, stripe_payment_intent, email, name, amount_cents, currency, source)
           VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (stripe_session_id) DO NOTHING RETURNING id`,
          [o.stripe_session_id, o.stripe_payment_intent, o.email, o.name, o.amount_cents, o.currency, o.source]);
        return { isNew: r.rowCount > 0 };
      },
      async markRefunded(paymentIntent) {
        await pool.query(`UPDATE preorders SET status = 'refunded', refunded_at = COALESCE(refunded_at, now()) WHERE stripe_payment_intent = $1`, [paymentIntent]);
      },
      async all() { return (await pool.query('SELECT * FROM preorders ORDER BY id')).rows; },
    };
  }
  const read = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
  const write = rows => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(rows, null, 2)); };
  return {
    async init() {},
    async record(o) {
      const rows = read();
      if (rows.some(r => r.stripe_session_id === o.stripe_session_id)) return { isNew: false };
      write([...rows, { id: rows.length + 1, ...o, status: 'paid', created_at: new Date().toISOString(), refunded_at: null }]);
      return { isNew: true };
    },
    async markRefunded(paymentIntent) {
      write(read().map(r => (r.stripe_payment_intent === paymentIntent ? { ...r, status: 'refunded', refunded_at: r.refunded_at || new Date().toISOString() } : r)));
    },
    async all() { return read(); },
  };
}

function confirmationEmail(to, orderedAt) {
  const refundBy = refundByDate(orderedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  return {
    to,
    subject: 'Your place in line for RECO',
    text: `Your place in line is held, and your ${dollars(DEPOSIT_CENTS)} deposit is in. You'll get yours ahead of people who haven't preordered.\n\n`
      + `This is non-binding. You haven't committed to buy. The expected price is ${EXPECTED_PRICE} in total, including your deposit, and we expect to ship in ${EXPECTED_SHIP}. Those are estimates. We'll confirm the final price and date before you decide, and nothing else is charged unless you say yes.\n\n`
      + `Changed your mind? Email ${CONTACT_EMAIL} anytime before you pay the balance and we'll refund the whole deposit. If yours hasn't shipped by ${refundBy}, we'll refund it without you asking.\n\n`
      + 'RECO is in development and is not a medical device.',
  };
}

function preorderHandlers({ stripe, store, env, sendEmail, tooMany, logError = console.error }) {
  const site = siteUrl(env);

  async function recordPaid(session) {
    if (session.metadata?.kind !== ORDER_KIND || session.payment_status !== 'paid') return;
    const email = (session.customer_details?.email || '').trim().toLowerCase();
    const { isNew } = await store.record({
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      email,
      name: session.customer_details?.name || '',
      amount_cents: session.amount_total,
      currency: session.currency,
      source: session.metadata.source || '',
    });
    if (isNew && email) await sendEmail(confirmationEmail(email, new Date()));
  }

  return {
    config(req, res) { res.json(readConfig(env)); },

    async checkout(req, res) {
      const config = readConfig(env);
      if (!config.enabled) return res.status(503).json({ ok: false, error: "Preorders aren't open yet." });
      if (tooMany(req.ip)) return res.status(429).json({ ok: false, error: 'Too many tries. Wait a few minutes and try again.' });
      try {
        const source = String(req.body?.source || '').replace(/[^a-z0-9_-]/gi, '').slice(0, MAX_SOURCE) || 'site';
        const metadata = { kind: ORDER_KIND, source };
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [{
            quantity: 1,
            price_data: {
              currency: CURRENCY,
              unit_amount: DEPOSIT_CENTS,
              product_data: {
                name: 'RECO preorder deposit',
                description: `Holds your place in line. Non-binding and refundable anytime before you pay the balance. Expected ${config.expectedPrice} in total, shipping in ${config.expectedShip}. In development. Not a medical device.`,
              },
            },
          }],
          customer_creation: 'always',
          metadata,
          payment_intent_data: { description: 'RECO preorder deposit', metadata },
          custom_text: { submit: { message: `Non-binding. Refundable in full anytime before you pay the balance, and automatically if yours hasn't shipped within ${REFUND_AFTER_MONTHS} months. Terms: ${site}/preorder/terms` } },
          success_url: `${site}/preorder/thanks`,
          cancel_url: `${site}/preorder/reserve`,
        });
        res.json({ ok: true, url: session.url });
      } catch (e) {
        logError('preorder checkout failed', e.message);
        res.status(502).json({ ok: false, error: "We couldn't open checkout, and you haven't been charged. Try again in a minute." });
      }
    },

    async webhook(req, res) {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
      } catch (e) {
        logError('stripe webhook signature rejected', e.message);
        return res.status(400).send('Invalid signature');
      }
      try {
        const object = event.data.object;
        if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') await recordPaid(object);
        if (event.type === 'charge.refunded' && object.refunded && object.payment_intent) await store.markRefunded(object.payment_intent);
        res.json({ received: true });
      } catch (e) {
        logError('stripe webhook failed', event.id, e.message);
        res.status(500).send('Try again');   // Stripe retries, and record() ignores a session it already has
      }
    },
  };
}

module.exports = { WEBHOOK_PATH, DEPOSIT_CENTS, EXPECTED_PRICE, EXPECTED_SHIP, REFUND_AFTER_MONTHS, refundByDate, readConfig, createPreorderStore, preorderHandlers };
