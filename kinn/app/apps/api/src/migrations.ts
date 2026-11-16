/**
 * The database, as numbered steps. Each runs once, in order, inside a transaction, and is
 * never edited after it has shipped: a change is a new step.
 *
 * What is stored is facts only. Nothing a screen shows (status, flags, the protocol phase,
 * RECO's own plan) is in here; the apps derive those from the record with @reco/core.
 */
export const MIGRATIONS: readonly { readonly version: number; readonly name: string; readonly sql: readonly string[] }[] = [
  {
    version: 1,
    name: 'accounts, sign-in, records, sharing, plans',
    sql: [
      `CREATE TABLE accounts (
        id uuid PRIMARY KEY,
        email text NOT NULL UNIQUE,
        role text NOT NULL CHECK (role IN ('patient', 'pt')),
        name text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL
      )`,
      // One-time sign-in codes. Only an HMAC of the code is kept.
      `CREATE TABLE login_codes (
        id uuid PRIMARY KEY,
        email text NOT NULL,
        role text NOT NULL CHECK (role IN ('patient', 'pt')),
        code_hash text NOT NULL,
        attempts integer NOT NULL DEFAULT 0,
        expires_at timestamptz NOT NULL,
        consumed_at timestamptz,
        created_at timestamptz NOT NULL
      )`,
      `CREATE INDEX login_codes_lookup ON login_codes (email, role, created_at DESC)`,
      // Only the SHA-256 of a session token is kept.
      `CREATE TABLE sessions (
        id uuid PRIMARY KEY,
        account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
        token_hash text NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL
      )`,
      // The patient's own record: one sealed document, with a revision for safe overwrites.
      `CREATE TABLE datasets (
        patient_id uuid PRIMARY KEY REFERENCES accounts (id) ON DELETE CASCADE,
        revision integer NOT NULL CHECK (revision >= 1),
        payload text NOT NULL,
        updated_at timestamptz NOT NULL
      )`,
      // A PT's sharing code. It names the PT; the patient decides whether to accept it.
      `CREATE TABLE invites (
        id uuid PRIMARY KEY,
        pt_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
        code_hash text NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        accepted_by uuid REFERENCES accounts (id) ON DELETE SET NULL,
        accepted_at timestamptz,
        created_at timestamptz NOT NULL
      )`,
      // The patient's choice to share, with what. Revoking sets revoked_at; the row stays as history.
      `CREATE TABLE shares (
        id uuid PRIMARY KEY,
        patient_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
        pt_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
        scopes jsonb NOT NULL,
        created_at timestamptz NOT NULL,
        revoked_at timestamptz
      )`,
      `CREATE UNIQUE INDEX shares_one_active ON shares (patient_id, pt_id) WHERE revoked_at IS NULL`,
      `CREATE INDEX shares_by_pt ON shares (pt_id) WHERE revoked_at IS NULL`,
      // Every published version of a plan, sealed. A version is never edited; the highest one is in use.
      `CREATE TABLE plans (
        id uuid PRIMARY KEY,
        patient_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
        pt_id uuid REFERENCES accounts (id) ON DELETE SET NULL,
        version integer NOT NULL CHECK (version >= 1),
        payload text NOT NULL,
        published_at timestamptz NOT NULL,
        UNIQUE (patient_id, version)
      )`,
      // What the patient sees under "who looked": each time a PT opened their record or published to them.
      `CREATE TABLE access_log (
        id uuid PRIMARY KEY,
        patient_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
        pt_id uuid REFERENCES accounts (id) ON DELETE SET NULL,
        pt_name text NOT NULL,
        action text NOT NULL CHECK (action IN ('viewed', 'published-plan')),
        at timestamptz NOT NULL
      )`,
      `CREATE INDEX access_log_by_patient ON access_log (patient_id, at DESC)`,
      `CREATE TABLE rate_limits (
        key text PRIMARY KEY,
        window_start timestamptz NOT NULL,
        count integer NOT NULL
      )`,
    ],
  },
]
