// Kinn teaser site + waitlist API: the Express app, without a listener.
// server.js runs it as a normal process (local dev); api/index.js exports it as a Vercel function.
// Storage: Postgres when DATABASE_URL is set, otherwise a local JSON file for development.
// Env vars:
//   DATABASE_URL     Postgres connection string (Neon through Vercel Storage, or any Postgres)
//   ADMIN_TOKEN      secret for /admin/waitlist.csv and /admin/stats (required to read the list)
//   RESEND_API_KEY   optional: send a welcome email through Resend
//   FROM_EMAIL       optional: sender for the welcome email, e.g. "Kinn <hello@yourdomain.com>"
//   ANTHROPIC_API_KEY optional: lets Claude read typed check-ins on /learn (the page falls back to reading them on the device)
//   VERCEL           set by Vercel; static files and the index.html fallback are then left to Vercel's CDN (see vercel.json)

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
      await pool.query('ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS sport TEXT');
      await pool.query('ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS channel TEXT');
    },
    async add(row) {
      const r = await pool.query(
        `INSERT INTO waitlist (email, role, injury, sport, alert, channel, note, source, referrer, user_agent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (email) DO UPDATE SET
           role = COALESCE(NULLIF(EXCLUDED.role,''), waitlist.role),
           injury = COALESCE(NULLIF(EXCLUDED.injury,''), waitlist.injury),
           sport = COALESCE(NULLIF(EXCLUDED.sport,''), waitlist.sport),
           alert = COALESCE(NULLIF(EXCLUDED.alert,''), waitlist.alert),
           channel = COALESCE(NULLIF(EXCLUDED.channel,''), waitlist.channel),
           note = COALESCE(NULLIF(EXCLUDED.note,''), waitlist.note)
         RETURNING id, (xmax = 0) AS inserted`,
        [row.email, row.role, row.injury, row.sport, row.alert, row.channel, row.note, row.source, row.referrer, row.user_agent]);
      const pos = await pool.query('SELECT COUNT(*)::int AS n FROM waitlist WHERE id <= $1', [r.rows[0].id]);
      return { isNew: r.rows[0].inserted, position: pos.rows[0].n };
    },
    async count() { return (await pool.query('SELECT COUNT(*)::int AS n FROM waitlist')).rows[0].n; },
    async all() { return (await pool.query('SELECT * FROM waitlist ORDER BY id')).rows; },
  };
} else {
  if (process.env.VERCEL) console.error('DATABASE_URL is not set: signups cannot be saved on Vercel. Add a Postgres database and set DATABASE_URL.');
  const file = path.join(__dirname, 'data', 'waitlist.json');
  const read = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
  const write = rows => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(rows, null, 2)); };
  store = {
    kind: 'json-file (development only — data is lost on redeploy)',
    async init() {},
    async add(row) {
      const rows = read(); const i = rows.findIndex(r => r.email === row.email);
      if (i >= 0) { for (const k of UPDATABLE) if (row[k]) rows[i][k] = row[k]; write(rows); return { isNew: false, position: i + 1 }; }
      rows.push({ id: rows.length + 1, ...row, created_at: new Date().toISOString() }); write(rows);
      return { isNew: true, position: rows.length };
    },
    async count() { return read().length; },
    async all() { return read(); },
  };
}

const ready = store.init();
app.use((req, res, next) => { ready.then(() => next(), next); });

/* ---------------- helpers ---------------- */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const clean = (v, n = 200) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const ROLES = ['recovering', 'supporting', 'clinician', 'movement', 'patient', 'pt', 'athlete', 'surgeon', 'other', ''];
const INJURIES = ['acl', 'meniscus', 'knee-replacement', 'patella', 'other-knee', 'shoulder', 'ankle', 'other-joint', 'not-injured', ''];
const ALERTS = ['yes', 'maybe', 'no', ''];
const SPORTS = ['basketball', 'soccer', 'volleyball', 'skiing', 'running', 'tennis', 'football', 'gym', 'other', 'everyday', ''];
const CHANNELS = ['clinic', 'teammate', 'online', 'social', 'event', 'other', ''];
const UPDATABLE = ['role', 'injury', 'sport', 'alert', 'channel', 'note'];
const pickFrom = (list, v) => (list.includes(clean(v)) ? clean(v) : '');

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
        text: "Thanks for joining the Kinn waitlist.\n\nWe're building a thin knee tape with a reusable coin that tracks how your knee bends and straightens through a comeback from an ACL or meniscus injury, so you know when to push and when to ease off. You'll get early access and updates as we build.\n\n— The Kinn team\n\nIf you didn't sign up, ignore this email and you won't hear from us again.",
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
    const row = {
      email,
      role: pickFrom(ROLES, b.role),
      injury: pickFrom(INJURIES, b.injury),
      sport: pickFrom(SPORTS, b.sport),
      alert: pickFrom(ALERTS, b.alert),
      channel: pickFrom(CHANNELS, b.channel),
      note: clean(b.note, 500),
      source: clean(b.source, 40).replace(/[^a-z0-9_-]/gi, '') || 'site',
      referrer: clean(req.get('referer') || '', 300),
      user_agent: clean(req.get('user-agent') || '', 300),
    };
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
  const cols = ['id', 'created_at', 'email', 'role', 'injury', 'sport', 'alert', 'channel', 'note', 'source', 'referrer'];
  const esc = v => { const s = v == null ? '' : (v instanceof Date ? v.toISOString() : String(v)); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="kinn-waitlist.csv"');
  res.send([cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n'));
});

app.get('/admin/stats', async (req, res) => {
  if (!tokenOk(req)) return res.status(401).json({ error: 'unauthorized' });
  const rows = await store.all(), tally = k => rows.reduce((m, r) => (m[r[k] || 'blank'] = (m[r[k] || 'blank'] || 0) + 1, m), {});
  res.json({ total: rows.length, byRole: tally('role'), byInjury: tally('injury'), bySport: tally('sport'), wantsAlert: tally('alert'), byChannel: tally('channel'), bySource: tally('source') });
});

// Outside Vercel the app serves public/ itself. Only the demo's hashed build files can be cached for
// long; everything else keeps its name when it changes, so browsers re-check it on every visit.
// On Vercel the CDN serves public/ and vercel.json sends unknown paths to index.html, so the function never sees them.
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'public'), { setHeaders: (res, p) => res.set('Cache-Control', p.includes(`${path.sep}learn${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache') }));
  app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Something went wrong on our side. Try again in a minute.' });
});

module.exports = { app, store, ready };
