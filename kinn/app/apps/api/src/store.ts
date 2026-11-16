/**
 * Every SQL statement the server runs, one small function each. Routes never write SQL, so
 * who-can-see-what is decided in one readable place (app.ts) and checked against these.
 * All values go in as parameters; nothing is ever spliced into a statement.
 */
import type { AccessAction, AccountRole, ShareScope } from '@reco/core'

import type { Queryable, Row } from './db'

const iso = (value: unknown): string => new Date(value as string | Date).toISOString()

export interface AccountRow { readonly id: string; readonly email: string; readonly role: AccountRole; readonly name: string }

const toAccount = (r: Row): AccountRow => ({ id: String(r.id), email: String(r.email), role: r.role as AccountRole, name: String(r.name) })

// ---- accounts ----

export async function findAccountByEmail(q: Queryable, email: string): Promise<AccountRow | undefined> {
  const [row] = await q.query('SELECT id, email, role, name FROM accounts WHERE email = $1', [email])
  return row ? toAccount(row) : undefined
}

export async function createAccount(q: Queryable, a: AccountRow, now: Date): Promise<AccountRow> {
  await q.query('INSERT INTO accounts (id, email, role, name, created_at) VALUES ($1, $2, $3, $4, $5::timestamptz)', [a.id, a.email, a.role, a.name, now.toISOString()])
  return a
}

export async function renameAccount(q: Queryable, id: string, name: string): Promise<void> {
  await q.query('UPDATE accounts SET name = $2 WHERE id = $1', [id, name])
}

/** Removes the account and, through the foreign keys, its sessions, record, shares, plans and access log. */
export async function deleteAccount(q: Queryable, account: AccountRow): Promise<void> {
  await q.query('DELETE FROM login_codes WHERE email = $1', [account.email])
  await q.query('DELETE FROM accounts WHERE id = $1', [account.id])
}

// ---- sign-in codes ----

export async function replaceLoginCode(q: Queryable, c: { id: string; email: string; role: AccountRole; codeHash: string; expiresAt: Date }, now: Date): Promise<void> {
  await q.query('UPDATE login_codes SET consumed_at = $3::timestamptz WHERE email = $1 AND role = $2 AND consumed_at IS NULL', [c.email, c.role, now.toISOString()])
  await q.query(
    'INSERT INTO login_codes (id, email, role, code_hash, expires_at, created_at) VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz)',
    [c.id, c.email, c.role, c.codeHash, c.expiresAt.toISOString(), now.toISOString()],
  )
}

/** Counts one guess against the live code for this email, and returns it. A wrong guess still counts. */
export async function countLoginAttempt(q: Queryable, email: string, role: AccountRole, now: Date): Promise<{ id: string; codeHash: string; attempts: number } | undefined> {
  const [row] = await q.query(
    `UPDATE login_codes SET attempts = attempts + 1
     WHERE id = (SELECT id FROM login_codes WHERE email = $1 AND role = $2 AND consumed_at IS NULL AND expires_at > $3::timestamptz ORDER BY created_at DESC LIMIT 1)
     RETURNING id, code_hash, attempts`,
    [email, role, now.toISOString()],
  )
  return row ? { id: String(row.id), codeHash: String(row.code_hash), attempts: Number(row.attempts) } : undefined
}

/** True only for the first caller, so a code cannot be used twice even by two requests at once. */
export async function consumeLoginCode(q: Queryable, id: string, now: Date): Promise<boolean> {
  const rows = await q.query('UPDATE login_codes SET consumed_at = $2::timestamptz WHERE id = $1 AND consumed_at IS NULL RETURNING id', [id, now.toISOString()])
  return rows.length === 1
}

// ---- sessions ----

export async function createSession(q: Queryable, s: { id: string; accountId: string; tokenHash: string; expiresAt: Date }, now: Date): Promise<void> {
  await q.query('DELETE FROM sessions WHERE expires_at <= $1::timestamptz', [now.toISOString()])
  await q.query(
    'INSERT INTO sessions (id, account_id, token_hash, expires_at, created_at) VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz)',
    [s.id, s.accountId, s.tokenHash, s.expiresAt.toISOString(), now.toISOString()],
  )
}

export async function findSessionAccount(q: Queryable, tokenHash: string, now: Date): Promise<AccountRow | undefined> {
  const [row] = await q.query(
    'SELECT a.id, a.email, a.role, a.name FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.token_hash = $1 AND s.expires_at > $2::timestamptz',
    [tokenHash, now.toISOString()],
  )
  return row ? toAccount(row) : undefined
}

export async function deleteSession(q: Queryable, tokenHash: string): Promise<void> {
  await q.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash])
}

// ---- rate limits ----

/** Counts one hit in a fixed window and returns the count so far. One atomic statement. */
export async function hit(q: Queryable, key: string, now: Date, windowMs: number): Promise<number> {
  const windowStart = new Date(now.getTime() - windowMs).toISOString()
  const [row] = await q.query(
    `INSERT INTO rate_limits (key, window_start, count) VALUES ($1, $2::timestamptz, 1)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start < $3::timestamptz THEN 1 ELSE rate_limits.count + 1 END,
       window_start = CASE WHEN rate_limits.window_start < $3::timestamptz THEN $2::timestamptz ELSE rate_limits.window_start END
     RETURNING count`,
    [key, now.toISOString(), windowStart],
  )
  return Number(row?.count ?? 1)
}

// ---- the patient's record ----

export interface DatasetRow { readonly revision: number; readonly payload: string; readonly updatedAt: string }

export async function getDataset(q: Queryable, patientId: string): Promise<DatasetRow | undefined> {
  const [row] = await q.query('SELECT revision, payload, updated_at FROM datasets WHERE patient_id = $1', [patientId])
  return row ? { revision: Number(row.revision), payload: String(row.payload), updatedAt: iso(row.updated_at) } : undefined
}

/** Saves over revision `base` only (0 = nothing stored yet). Returns the new revision, or undefined if someone else got there first. */
export async function saveDataset(q: Queryable, patientId: string, base: number, payload: string, now: Date): Promise<number | undefined> {
  const rows = base === 0
    ? await q.query('INSERT INTO datasets (patient_id, revision, payload, updated_at) VALUES ($1, 1, $2, $3::timestamptz) ON CONFLICT (patient_id) DO NOTHING RETURNING revision', [patientId, payload, now.toISOString()])
    : await q.query('UPDATE datasets SET revision = revision + 1, payload = $2, updated_at = $3::timestamptz WHERE patient_id = $1 AND revision = $4 RETURNING revision', [patientId, payload, now.toISOString(), base])
  return rows[0] ? Number(rows[0].revision) : undefined
}

// ---- sharing codes ----

export async function createInvite(q: Queryable, i: { id: string; ptId: string; codeHash: string; expiresAt: Date }, now: Date): Promise<void> {
  await q.query(
    'INSERT INTO invites (id, pt_id, code_hash, expires_at, created_at) VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz)',
    [i.id, i.ptId, i.codeHash, i.expiresAt.toISOString(), now.toISOString()],
  )
}

export async function findOpenInvite(q: Queryable, codeHash: string, now: Date): Promise<{ id: string; pt: AccountRow } | undefined> {
  const [row] = await q.query(
    `SELECT i.id AS invite_id, a.id, a.email, a.role, a.name FROM invites i JOIN accounts a ON a.id = i.pt_id
     WHERE i.code_hash = $1 AND i.accepted_at IS NULL AND i.expires_at > $2::timestamptz`,
    [codeHash, now.toISOString()],
  )
  return row ? { id: String(row.invite_id), pt: toAccount(row) } : undefined
}

export async function markInviteAccepted(q: Queryable, inviteId: string, patientId: string, now: Date): Promise<boolean> {
  const rows = await q.query('UPDATE invites SET accepted_by = $2, accepted_at = $3::timestamptz WHERE id = $1 AND accepted_at IS NULL RETURNING id', [inviteId, patientId, now.toISOString()])
  return rows.length === 1
}

// ---- shares ----

export interface ShareRow { readonly id: string; readonly patientId: string; readonly pt: { readonly name: string; readonly email: string }; readonly scopes: readonly ShareScope[]; readonly since: string }

const toShare = (r: Row): ShareRow => ({
  id: String(r.id),
  patientId: String(r.patient_id),
  pt: { name: String(r.pt_name), email: String(r.pt_email) },
  scopes: r.scopes as readonly ShareScope[],
  since: iso(r.created_at),
})

const SHARE_SELECT = `SELECT s.id, s.patient_id, s.scopes, s.created_at, a.name AS pt_name, a.email AS pt_email
  FROM shares s JOIN accounts a ON a.id = s.pt_id`

export async function listShares(q: Queryable, patientId: string): Promise<readonly ShareRow[]> {
  return (await q.query(`${SHARE_SELECT} WHERE s.patient_id = $1 AND s.revoked_at IS NULL ORDER BY s.created_at`, [patientId])).map(toShare)
}

export async function findShare(q: Queryable, shareId: string, patientId: string): Promise<ShareRow | undefined> {
  const [row] = await q.query(`${SHARE_SELECT} WHERE s.id = $1 AND s.patient_id = $2 AND s.revoked_at IS NULL`, [shareId, patientId])
  return row ? toShare(row) : undefined
}

/** Turns sharing on with this PT, or changes what an existing share carries. */
export async function upsertShare(q: Queryable, s: { id: string; patientId: string; ptId: string; scopes: readonly ShareScope[] }, now: Date): Promise<string> {
  const [row] = await q.query(
    `INSERT INTO shares (id, patient_id, pt_id, scopes, created_at) VALUES ($1, $2, $3, $4::jsonb, $5::timestamptz)
     ON CONFLICT (patient_id, pt_id) WHERE revoked_at IS NULL DO UPDATE SET scopes = EXCLUDED.scopes
     RETURNING id`,
    [s.id, s.patientId, s.ptId, JSON.stringify(s.scopes), now.toISOString()],
  )
  return String(row?.id)
}

export async function setShareScopes(q: Queryable, shareId: string, patientId: string, scopes: readonly ShareScope[]): Promise<void> {
  await q.query('UPDATE shares SET scopes = $3::jsonb WHERE id = $1 AND patient_id = $2 AND revoked_at IS NULL', [shareId, patientId, JSON.stringify(scopes)])
}

export async function revokeShare(q: Queryable, shareId: string, patientId: string, now: Date): Promise<boolean> {
  const rows = await q.query('UPDATE shares SET revoked_at = $3::timestamptz WHERE id = $1 AND patient_id = $2 AND revoked_at IS NULL RETURNING id', [shareId, patientId, now.toISOString()])
  return rows.length === 1
}

/** The share that lets this PT act for this patient, if the patient has one turned on. */
export async function activeShare(q: Queryable, ptId: string, patientId: string): Promise<{ scopes: readonly ShareScope[] } | undefined> {
  const [row] = await q.query('SELECT scopes FROM shares WHERE pt_id = $1 AND patient_id = $2 AND revoked_at IS NULL', [ptId, patientId])
  return row ? { scopes: row.scopes as readonly ShareScope[] } : undefined
}

export interface CaseloadRow {
  readonly patientId: string
  readonly accountName: string
  readonly scopes: readonly ShareScope[]
  readonly sharedSince: string
  readonly dataset: DatasetRow | undefined
  readonly plan: { readonly version: number; readonly payload: string } | undefined
}

/** Everyone sharing with this PT right now, with their record and latest plan, in one query. */
export async function caseload(q: Queryable, ptId: string): Promise<readonly CaseloadRow[]> {
  const rows = await q.query(
    `SELECT s.patient_id, s.scopes, s.created_at, a.name AS account_name,
            d.revision, d.payload, d.updated_at,
            p.version AS plan_version, p.payload AS plan_payload
     FROM shares s
     JOIN accounts a ON a.id = s.patient_id
     LEFT JOIN datasets d ON d.patient_id = s.patient_id
     LEFT JOIN LATERAL (SELECT version, payload FROM plans WHERE patient_id = s.patient_id ORDER BY version DESC LIMIT 1) p ON true
     WHERE s.pt_id = $1 AND s.revoked_at IS NULL
     ORDER BY s.created_at`,
    [ptId],
  )
  return rows.map((r) => ({
    patientId: String(r.patient_id),
    accountName: String(r.account_name),
    scopes: r.scopes as readonly ShareScope[],
    sharedSince: iso(r.created_at),
    dataset: r.payload != null ? { revision: Number(r.revision), payload: String(r.payload), updatedAt: iso(r.updated_at) } : undefined,
    plan: r.plan_payload != null ? { version: Number(r.plan_version), payload: String(r.plan_payload) } : undefined,
  }))
}

// ---- plans ----

export interface PlanRow { readonly version: number; readonly payload: string; readonly publishedAt: string }

const toPlan = (r: Row): PlanRow => ({ version: Number(r.version), payload: String(r.payload), publishedAt: iso(r.published_at) })

export async function latestPlan(q: Queryable, patientId: string): Promise<PlanRow | undefined> {
  const [row] = await q.query('SELECT version, payload, published_at FROM plans WHERE patient_id = $1 ORDER BY version DESC LIMIT 1', [patientId])
  return row ? toPlan(row) : undefined
}

export async function listPlans(q: Queryable, patientId: string): Promise<readonly PlanRow[]> {
  return (await q.query('SELECT version, payload, published_at FROM plans WHERE patient_id = $1 ORDER BY version DESC LIMIT 200', [patientId])).map(toPlan)
}

export async function insertPlan(q: Queryable, p: { id: string; patientId: string; ptId: string; version: number; payload: string }, now: Date): Promise<void> {
  await q.query(
    'INSERT INTO plans (id, patient_id, pt_id, version, payload, published_at) VALUES ($1, $2, $3, $4, $5, $6::timestamptz)',
    [p.id, p.patientId, p.ptId, p.version, p.payload, now.toISOString()],
  )
}

// ---- who looked ----

export async function logAccess(q: Queryable, e: { id: string; patientId: string; ptId: string; ptName: string; action: AccessAction }, now: Date): Promise<void> {
  await q.query(
    'INSERT INTO access_log (id, patient_id, pt_id, pt_name, action, at) VALUES ($1, $2, $3, $4, $5, $6::timestamptz)',
    [e.id, e.patientId, e.ptId, e.ptName, e.action, now.toISOString()],
  )
}

/** One "viewed" line per patient on this PT's caseload, at most one per quiet period, so refreshing doesn't flood the list. */
export async function logCaseloadView(q: Queryable, pt: AccountRow, now: Date, quietMs: number): Promise<void> {
  await q.query(
    `INSERT INTO access_log (id, patient_id, pt_id, pt_name, action, at)
     SELECT gen_random_uuid(), s.patient_id, $1, $2, 'viewed', $3::timestamptz
     FROM shares s
     WHERE s.pt_id = $1 AND s.revoked_at IS NULL
       AND NOT EXISTS (SELECT 1 FROM access_log l WHERE l.patient_id = s.patient_id AND l.pt_id = $1 AND l.action = 'viewed' AND l.at > $4::timestamptz)`,
    [pt.id, pt.name, now.toISOString(), new Date(now.getTime() - quietMs).toISOString()],
  )
}

/** The same, for one patient: used when a PT opens something of theirs outside the caseload read. */
export async function logPatientView(q: Queryable, pt: AccountRow, patientId: string, now: Date, quietMs: number): Promise<void> {
  await q.query(
    `INSERT INTO access_log (id, patient_id, pt_id, pt_name, action, at)
     SELECT gen_random_uuid(), $5, $1, $2, 'viewed', $3::timestamptz
     WHERE NOT EXISTS (SELECT 1 FROM access_log l WHERE l.patient_id = $5 AND l.pt_id = $1 AND l.action = 'viewed' AND l.at > $4::timestamptz)`,
    [pt.id, pt.name, now.toISOString(), new Date(now.getTime() - quietMs).toISOString(), patientId],
  )
}

export async function listAccess(q: Queryable, patientId: string, limit: number): Promise<readonly { ptName: string; action: AccessAction; at: string }[]> {
  return (await q.query('SELECT pt_name, action, at FROM access_log WHERE patient_id = $1 ORDER BY at DESC LIMIT $2', [patientId, limit]))
    .map((r) => ({ ptName: String(r.pt_name), action: r.action as AccessAction, at: iso(r.at) }))
}
