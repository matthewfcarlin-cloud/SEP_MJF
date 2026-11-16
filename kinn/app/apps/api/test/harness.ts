import { randomBytes } from 'node:crypto'

import { createApiClient } from '@reco/core'
import type { Account, AccountRole, ApiClient, FetchLike } from '@reco/core'

import { createApp } from '../src/app'
import type { Logger } from '../src/app'
import { loadConfig } from '../src/config'
import type { Config } from '../src/config'
import { migrate, pgliteDb } from '../src/db'
import type { Db } from '../src/db'
import type { Mailer } from '../src/mail'

export const START = new Date('2026-11-15T17:00:00.000Z')
const TABLES = ['access_log', 'plans', 'shares', 'invites', 'datasets', 'sessions', 'login_codes', 'rate_limits', 'accounts']

export interface Harness {
  readonly db: Db
  readonly config: Config
  readonly app: ReturnType<typeof createApp>
  readonly sent: { to: string; subject: string; text: string }[]
  readonly errors: string[]
  /** Moves the server's clock forward. */
  advance(ms: number): void
  reset(): Promise<void>
  close(): Promise<void>
  fetch: FetchLike
  /** A client with no session. */
  anonymous(): ApiClient
  /** Signs in (creating the account the first time) and returns a client holding the session. */
  signIn(email: string, role: AccountRole, name?: string): Promise<{ api: ApiClient; account: Account; token: string }>
  request(method: string, path: string, init?: { token?: string; body?: unknown; headers?: Record<string, string> }): Promise<{ status: number; headers: Headers; body: any }>
}

/** @param existing a database to use instead of a fresh in-memory one (the Postgres driver test passes its own). */
export async function createHarness(overrides: Record<string, string | undefined> = {}, existing?: Db): Promise<Harness> {
  const db = existing ?? (await pgliteDb())
  await migrate(db)
  const config = loadConfig({ RECO_ENV: 'test', AUTH_SECRET: randomBytes(48).toString('base64'), DATA_KEY: randomBytes(32).toString('base64'), CORS_ORIGINS: 'https://clinic.example', ...overrides })
  let clock = START.getTime()
  const sent: Harness['sent'] = []
  const errors: string[] = []
  const mailer: Mailer | undefined = config.exposeDevCodes ? undefined : { send: async (m) => { sent.push({ ...m }) } }
  const log: Logger = { error: (message, detail) => { errors.push(`${message} ${JSON.stringify(detail ?? {})}`) } }
  const app = createApp({ db, config, mailer, now: () => new Date(clock), log })

  const request: Harness['request'] = async (method, path, init = {}) => {
    const response = await app.request(`http://reco.test${path}`, {
      method,
      headers: { ...(init.body !== undefined ? { 'content-type': 'application/json' } : {}), ...(init.token ? { authorization: `Bearer ${init.token}` } : {}), ...init.headers },
      ...(init.body !== undefined ? { body: typeof init.body === 'string' ? init.body : JSON.stringify(init.body) } : {}),
    })
    const text = await response.text()
    return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : undefined }
  }
  const fetch: FetchLike = async (url, init) => app.request(url, init)
  const client = (token?: string): ApiClient => createApiClient({ baseUrl: 'http://reco.test', fetch, token: () => token })

  return {
    db, config, app, sent, errors, fetch, request,
    advance: (ms) => { clock += ms },
    reset: async () => {
      clock = START.getTime()
      sent.length = 0
      errors.length = 0
      await db.query(`TRUNCATE ${TABLES.join(', ')} CASCADE`)
    },
    close: () => db.close(),
    anonymous: () => client(),
    signIn: async (email, role, name) => {
      const { devCode } = await client().startSignIn(email, role)
      if (!devCode) throw new Error('harness: expected a dev code')
      const { token, account } = await client().verifySignIn({ email, role, code: devCode, ...(name !== undefined ? { name } : {}) })
      return { api: client(token), account, token }
    },
  }
}
