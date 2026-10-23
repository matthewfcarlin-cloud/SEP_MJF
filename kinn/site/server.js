// Kinn teaser site + waitlist API.
// Storage: Postgres when DATABASE_URL is set (Railway), otherwise a local JSON file for development.
// Env vars:
//   DATABASE_URL     Postgres connection string (Railway sets this when you add a Postgres database and reference it)
//   ADMIN_TOKEN      secret for /admin/waitlist.csv and /admin/stats (required to read the list)
//   RESEND_API_KEY   optional: send a welcome email through Resend
//   FROM_EMAIL       optional: sender for the welcome email, e.g. "Kinn <hello@yourdomain.com>"
//   ANTHROPIC_API_KEY optional: lets Claude read typed check-ins on /learn (the page falls back to reading them on the device)
//   PORT             set by Railway

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { checkin } = require('./checkin');

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

/* ---------------- storage ---------------- */
let store;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1|\.railway\.internal/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
  });
  store = {
    kind: 'postgres',
    async init() {
      await pool.query(`CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT, injury TEXT, note TEXT, source TEXT,
        referrer TEXT, user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
      await pool.query('ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS alert TEXT');
    },
    async add(row) {
      const r = await pool.query(
        `INSERT INTO waitlist (email, role, injury, alert, note, source, referrer, user_agent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (email) DO UPDATE SET
           role = COALESCE(NULLIF(EXCLUDED.role,''), waitlist.role),
           injury = COALESCE(NULLIF(EXCLUDED.injury,''), waitlist.injury),
           alert = COALESCE(NULLIF(EXCLUDED.alert,''), waitlist.alert),
           note = COALESCE(NULLIF(EXCLUDED.note,''), waitlist.note)
         RETURNING id, (xmax = 0) AS inserted`,
        [row.email, row.role, row.injury, row.alert, row.note, row.source, row.referrer, row.user_agent]);
      const pos = await pool.query('SELECT COUNT(*)::int AS n FROM waitlist WHERE id <= $1', [r.rows[0].id]);
      return { isNew: r.rows[0].inserted, position: pos.rows[0].n };
    },
    async count() { return (await pool.query('SELECT COUNT(*)::int AS n FROM waitlist')).rows[0].n; },
    async all() { return (await pool.query('SELECT * FROM waitlist ORDER BY id')).rows; },
  };
} else {
  const file = path.join(__dirname, 'data', 'waitlist.json');
  const read = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
  const write = rows => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(rows, null, 2)); };
  store = {
    kind: 'json-file (development only — data is lost on redeploy)',
    async init() {},
    async add(row) {
      const rows = read(); const i = rows.findIndex(r => r.email === row.email);
      if (i >= 0) { for (const k of ['role', 'injury', 'alert', 'note']) if (row[k]) rows[i][k] = row[k]; write(rows); return { isNew: false, position: i + 1 }; }
      rows.push({ id: rows.length + 1, ...row, created_at: new Date().toISOString() }); write(rows);
      return { isNew: true, position: rows.length };
    },
    async count() { return read().length; },
    async all() { return read(); },
  };
}

/* ---------------- helpers ---------------- */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const clean = (v, n = 200) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const ROLES = ['recovering', 'supporting', 'clinician', 'movement', 'patient', 'pt', 'athlete', 'surgeon', 'other', ''];
const INJURIES = ['acl', 'meniscus', 'knee-replacement', 'patella', 'other-knee', 'shoulder', 'ankle', 'other-joint', 'not-injured', ''];
const ALERTS = ['yes', 'maybe', 'no', ''];

function rateLimiter(max, win = 10 * 60 * 1000) {
  const hits = new Map();
  return ip => {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter(t => now - t < win);
    arr.push(now); hits.set(ip, arr);
    if (hits.size > 5000) hits.clear();
    return arr.length > max;
  };
}
const rateLimited = rateLimiter(8);
const checkinLimited = rateLimiter(30);
function tokenOk(req) {
  const want = process.env.ADMIN_TOKEN; if (!want) return false;
  const got = String(req.query.token || req.get('x-admin-token') || '');
  const a = Buffer.from(got), b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
async function welcomeEmail(to) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL, to,
        subject: "You're on the Kinn waitlist",
        text: "Thanks for joining the Kinn waitlist.\n\nWe're exploring new ways to help people understand their recovery and rebuild strength with more confidence. You'll get early access and updates as we build.\n\n— The Kinn team\n\nIf you didn't sign up, ignore this email and you won't hear from us again.",
      }),
    });
  } catch (e) { console.error('welcome email failed', e.message); }
}

/* ---------------- routes ---------------- */
app.get('/healthz', (req, res) => res.json({ ok: true, store: store.kind }));

app.post('/api/waitlist', async (req, res) => {
  try {
    if (rateLimited(req.ip)) return res.status(429).json({ ok: false, error: 'Too many tries. Wait a few minutes and try again.' });
    const b = req.body || {};
    if (clean(b.company)) return res.json({ ok: true, position: null }); // honeypot field: bots fill it, people never see it
    const email = clean(b.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Enter a full email address, like name@example.com.' });
    const role = ROLES.includes(clean(b.role)) ? clean(b.role) : '';
    const injury = INJURIES.includes(clean(b.injury)) ? clean(b.injury) : '';
    const alert = ALERTS.includes(clean(b.alert)) ? clean(b.alert) : '';
    const row = { email, role, injury, alert, note: clean(b.note, 500), source: clean(b.source, 40), referrer: clean(req.get('referer') || '', 300), user_agent: clean(req.get('user-agent') || '', 300) };
    const out = await store.add(row);
    if (out.isNew) welcomeEmail(email);
    res.json({ ok: true, position: out.position, isNew: out.isNew });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Something went wrong on our side. Try again in a minute." });
  }
});

app.post('/api/checkin', (req, res) => {
  if (checkinLimited(req.ip)) return res.status(429).json({ error: 'Too many check-ins. Wait a few minutes and try again.' });
  checkin(req, res);
});

app.get('/api/waitlist/count', async (req, res) => {
  try { res.json({ count: await store.count() }); } catch { res.json({ count: null }); }
});

app.get('/admin/waitlist.csv', async (req, res) => {
  if (!tokenOk(req)) return res.status(401).send('Unauthorized. Add ?token=YOUR_ADMIN_TOKEN');
  const rows = await store.all();
  const cols = ['id', 'created_at', 'email', 'role', 'injury', 'alert', 'note', 'source', 'referrer'];
  const esc = v => { const s = v == null ? '' : (v instanceof Date ? v.toISOString() : String(v)); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="kinn-waitlist.csv"');
  res.send([cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n'));
});

app.get('/admin/stats', async (req, res) => {
  if (!tokenOk(req)) return res.status(401).json({ error: 'unauthorized' });
  const rows = await store.all(), tally = k => rows.reduce((m, r) => (m[r[k] || 'blank'] = (m[r[k] || 'blank'] || 0) + 1, m), {});
  res.json({ total: rows.length, byRole: tally('role'), byInjury: tally('injury'), wantsAlert: tally('alert'), bySource: tally('source') });
});

// Only the demo's hashed build files can be cached for long; everything else (pages, progress
// screenshots, brand files) keeps its name when it changes, so browsers re-check it on every visit.
app.use(express.static(path.join(__dirname, 'public'), { setHeaders: (res, p) => res.set('Cache-Control', p.includes(`${path.sep}learn${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache') }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

const port = process.env.PORT || 3000;
store.init().then(() => app.listen(port, () => console.log(`Kinn site on :${port} (storage: ${store.kind})`)))
  .catch(e => { console.error('storage init failed', e); process.exit(1); });
