const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const Stripe = require('stripe');
const { WEBHOOK_PATH, DEPOSIT_CENTS, EXPECTED_PRICE, EXPECTED_SHIP, REFUND_AFTER_MONTHS, refundByDate, readConfig, createPreorderStore, preorderHandlers } = require('../preorder');

const SECRET = 'whsec_test_secret';
const ENV = { STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_WEBHOOK_SECRET: SECRET, SITE_URL: 'https://example.test' };
const realStripe = new Stripe('sk_test_x');

function paidSession(overrides = {}) {
  return { id: 'cs_1', object: 'checkout.session', payment_status: 'paid', payment_intent: 'pi_1', amount_total: DEPOSIT_CENTS, currency: 'usd', customer_details: { email: 'Buyer@Example.com', name: 'A Buyer' }, metadata: { kind: 'reco-preorder', source: 'reddit' }, ...overrides };
}

async function harness(t, { env = ENV, create, sendEmail = async () => {}, tooMany = () => false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'preorder-'));
  const store = createPreorderStore({ file: path.join(dir, 'preorders.json') });
  await store.init();
  const calls = [];
  const stripe = { webhooks: realStripe.webhooks, checkout: { sessions: { create: create || (async params => { calls.push(params); return { id: 'cs_1', url: 'https://checkout.stripe.test/cs_1' }; }) } } };
  const h = preorderHandlers({ stripe, store, env, sendEmail, tooMany, logError: () => {} });
  const app = express();
  app.post(WEBHOOK_PATH, express.raw({ type: 'application/json' }), h.webhook);
  app.use(express.json());
  app.get('/api/preorder/config', h.config);
  app.post('/api/preorder/checkout', h.checkout);
  const server = await new Promise(r => { const s = app.listen(0, () => r(s)); });
  t.after(() => { server.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  return { base: `http://127.0.0.1:${server.address().port}`, store, calls };
}

function post(base, event, secret = SECRET) {
  const payload = JSON.stringify(event);
  const header = realStripe.webhooks.generateTestHeaderString({ payload, secret });
  return fetch(base + WEBHOOK_PATH, { method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': header }, body: payload });
}
const completed = session => ({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: session } });

test('the deal is a $49 deposit on a $150 product, refunded after 12 months', () => {
  assert.equal(DEPOSIT_CENTS, 4900);
  assert.equal(EXPECTED_PRICE, '$150');
  assert.equal(EXPECTED_SHIP, '6 to 12 months');
  assert.equal(REFUND_AFTER_MONTHS, 12);
  assert.equal(refundByDate('2026-11-06T00:00:00Z').toISOString().slice(0, 10), '2027-11-06');
});

test('preorders stay off until both Stripe keys are set', () => {
  assert.equal(readConfig(ENV).enabled, true);
  for (const key of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']) {
    assert.equal(readConfig({ ...ENV, [key]: '' }).enabled, false, key);
  }
});

test('config never exposes a secret', async t => {
  const { base } = await harness(t);
  const text = await (await fetch(`${base}/api/preorder/config`)).text();
  assert.ok(!text.includes('sk_test') && !text.includes('whsec'));
  assert.deepEqual(JSON.parse(text), { enabled: true, depositCents: DEPOSIT_CENTS, expectedPrice: '$150', expectedShip: '6 to 12 months', refundAfterMonths: 12 });
});

test('checkout returns 503 and calls nothing while preorders are off', async t => {
  const { base, calls } = await harness(t, { env: { ...ENV, STRIPE_SECRET_KEY: '' } });
  const res = await fetch(`${base}/api/preorder/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 503);
  assert.equal(calls.length, 0);
});

test('checkout sets the amount on the server, whatever the browser sends', async t => {
  const { base, calls } = await harness(t);
  const res = await fetch(`${base}/api/preorder/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'red<dit', amount: 1, unit_amount: 1, success_url: 'https://evil.test' }) });
  const body = await res.json();
  assert.equal(body.url, 'https://checkout.stripe.test/cs_1');
  const [params] = calls;
  assert.equal(params.mode, 'payment');
  assert.equal(params.line_items[0].price_data.unit_amount, DEPOSIT_CENTS);
  assert.equal(params.line_items[0].quantity, 1);
  assert.ok(params.success_url.startsWith('https://example.test/preorder/thanks'));
  assert.equal(params.cancel_url, 'https://example.test/preorder/reserve');
  assert.equal(params.metadata.kind, 'reco-preorder');
  assert.equal(params.metadata.source, 'reddit');
});

test('a Stripe failure tells the buyer they were not charged', async t => {
  const { base } = await harness(t, { create: async () => { throw new Error('boom sk_test_x'); } });
  const res = await fetch(`${base}/api/preorder/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 502);
  const { error } = await res.json();
  assert.match(error, /haven't been charged/);
  assert.ok(!error.includes('sk_test'));
});

test('checkout is rate limited', async t => {
  const { base, calls } = await harness(t, { tooMany: () => true });
  const res = await fetch(`${base}/api/preorder/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 429);
  assert.equal(calls.length, 0);
});

test('a webhook with a bad signature records nothing', async t => {
  const { base, store } = await harness(t);
  const res = await post(base, completed(paidSession()), 'whsec_wrong');
  assert.equal(res.status, 400);
  assert.equal((await store.all()).length, 0);
});

test('a paid session is recorded once and emailed once, even when Stripe retries', async t => {
  const sent = [];
  const { base, store } = await harness(t, { sendEmail: async m => sent.push(m) });
  assert.equal((await post(base, completed(paidSession()))).status, 200);
  assert.equal((await post(base, completed(paidSession()))).status, 200);
  const rows = await store.all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, 'buyer@example.com');
  assert.equal(rows[0].amount_cents, DEPOSIT_CENTS);
  assert.equal(rows[0].status, 'paid');
  assert.equal(rows[0].source, 'reddit');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'buyer@example.com');
  assert.match(sent[0].text, /non-binding/);
  assert.match(sent[0].text, /refund it without you asking/);
});

test('an unpaid session is not recorded until its payment succeeds', async t => {
  const { base, store } = await harness(t);
  await post(base, completed(paidSession({ payment_status: 'unpaid' })));
  assert.equal((await store.all()).length, 0);
  await post(base, { id: 'evt_2', object: 'event', type: 'checkout.session.async_payment_succeeded', data: { object: paidSession() } });
  assert.equal((await store.all()).length, 1);
});

test('other sales on the same Stripe account are ignored', async t => {
  const { base, store } = await harness(t);
  assert.equal((await post(base, completed(paidSession({ metadata: {} })))).status, 200);
  assert.equal((await store.all()).length, 0);
});

test('a full refund marks the order refunded, a partial one does not', async t => {
  const { base, store } = await harness(t);
  await post(base, completed(paidSession()));
  const refund = refunded => ({ id: 'evt_3', object: 'event', type: 'charge.refunded', data: { object: { object: 'charge', payment_intent: 'pi_1', refunded } } });
  await post(base, refund(false));
  assert.equal((await store.all())[0].status, 'paid');
  await post(base, refund(true));
  const [row] = await store.all();
  assert.equal(row.status, 'refunded');
  assert.ok(row.refunded_at);
});

test('a storage failure asks Stripe to retry', async t => {
  const { base, store } = await harness(t);
  store.record = async () => { throw new Error('db down'); };
  assert.equal((await post(base, completed(paidSession()))).status, 500);
});
