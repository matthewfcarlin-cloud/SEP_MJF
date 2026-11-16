/**
 * The one door to the database. Production uses Postgres through `pg`; a local run and the
 * tests use PGlite, which is real Postgres compiled to run in-process, so the same SQL is
 * exercised either way.
 */
import { MIGRATIONS } from './migrations'

export type Row = Record<string, unknown>

export interface Queryable {
  query<T extends Row = Row>(sql: string, params?: readonly unknown[]): Promise<readonly T[]>
}

export interface Db extends Queryable {
  readonly kind: 'postgres' | 'pglite'
  /** Runs `work` in one transaction; anything thrown rolls it back. */
  transaction<T>(work: (tx: Queryable) => Promise<T>): Promise<T>
  close(): Promise<void>
}

const LOCAL_HOST = /localhost|127\.0\.0\.1/

export async function postgresDb(connectionString: string): Promise<Db> {
  const { default: pg } = await import('pg')
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    ...(LOCAL_HOST.test(connectionString) ? {} : { ssl: { rejectUnauthorized: true } }),
  })
  const run = (client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: Row[] }> }): Queryable => ({
    query: async <T extends Row>(sql: string, params: readonly unknown[] = []) => (await client.query(sql, [...params])).rows as T[],
  })
  return {
    kind: 'postgres',
    ...run(pool),
    async transaction(work) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await work(run(client))
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    close: () => pool.end(),
  }
}

/** @param dataDir a folder to keep the data in, or nothing for memory only (tests). */
export async function pgliteDb(dataDir?: string): Promise<Db> {
  const { PGlite } = await import('@electric-sql/pglite')
  const lite = new PGlite(dataDir)
  await lite.waitReady
  const run = (client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> }): Queryable => ({
    query: async <T extends Row>(sql: string, params: readonly unknown[] = []) => (await client.query(sql, [...params])).rows as T[],
  })
  return {
    kind: 'pglite',
    ...run(lite),
    transaction: (work) => lite.transaction((tx) => work(run(tx))) as Promise<never>,
    close: () => lite.close(),
  }
}

/** Brings the database up to the latest step. Safe to run on every start. */
export async function migrate(db: Db): Promise<readonly number[]> {
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, name text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())')
  const done = new Set((await db.query<{ version: number }>('SELECT version FROM schema_migrations')).map((r) => r.version))
  const applied: number[] = []
  for (const step of MIGRATIONS) {
    if (done.has(step.version)) continue
    await db.transaction(async (tx) => {
      for (const sql of step.sql) await tx.query(sql)
      await tx.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2)', [step.version, step.name])
    })
    applied.push(step.version)
  }
  return applied
}
