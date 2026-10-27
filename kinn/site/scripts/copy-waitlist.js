// One-off: copy the waitlist from one Postgres database to another, for moving hosts.
//   SOURCE_DATABASE_URL=postgres://...old...  DATABASE_URL=postgres://...new...  node scripts/copy-waitlist.js
// Safe to re-run: rows are matched on email and existing rows in the target are left as they are.

const { Pool } = require('pg');

const COLS = ['email', 'role', 'injury', 'sport', 'alert', 'channel', 'note', 'source', 'referrer', 'user_agent', 'created_at'];

function pool(url) {
  if (!url) return null;
  const isLocal = /localhost|127\.0\.0\.1|\.railway\.internal/.test(url);
  return new Pool({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });
}

async function main() {
  const from = pool(process.env.SOURCE_DATABASE_URL), to = pool(process.env.DATABASE_URL);
  if (!from || !to) throw new Error('Set both SOURCE_DATABASE_URL (old database) and DATABASE_URL (new database).');
  if (process.env.SOURCE_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Source and target are the same database.');

  const { store } = require('../app'); // same schema setup the site uses (CREATE TABLE / ADD COLUMN)
  await store.init();

  const rows = (await from.query('SELECT * FROM waitlist ORDER BY id')).rows;
  const placeholders = COLS.map((_, i) => `$${i + 1}`).join(',');
  const results = await Promise.all(rows.map(r => to.query(
    `INSERT INTO waitlist (${COLS.join(',')}) VALUES (${placeholders}) ON CONFLICT (email) DO NOTHING RETURNING id`,
    COLS.map(c => (r[c] == null ? (c === 'created_at' ? new Date() : '') : r[c])),
  )));
  const inserted = results.filter(r => r.rowCount > 0).length;
  const total = (await to.query('SELECT COUNT(*)::int AS n FROM waitlist')).rows[0].n;
  console.log(`read ${rows.length} rows from source; inserted ${inserted} new; target now holds ${total}`);
  await Promise.all([from.end(), to.end()]);
  process.exit(0); // app.js keeps its own pool open
}

main().catch(e => { console.error('copy failed:', e.message); process.exit(1); });
