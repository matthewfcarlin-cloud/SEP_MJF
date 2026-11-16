/**
 * Puts the server together from its environment: config, database, mailer, log. Used by the
 * plain Node entry (server.ts) and the Vercel function (vercel.ts), so both run the same thing.
 */
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { createApp } from './app'
import type { Logger } from './app'
import { loadConfig } from './config'
import type { Config, DevSecrets } from './config'
import { migrate, pgliteDb, postgresDb } from './db'
import type { Db } from './db'
import { resendMailer } from './mail'

const DEV_DIR = '.data'

/** One JSON line per failure on stderr, where the host's log viewer picks it up. Never carries request bodies. */
const jsonLog: Logger = {
  error: (message, detail) => process.stderr.write(`${JSON.stringify({ level: 'error', at: new Date().toISOString(), message, ...detail })}\n`),
}

/** Stand-in secrets for a laptop, made once and kept beside the local database so its data stays readable. */
function devSecrets(dir: string): DevSecrets {
  const file = join(dir, 'dev-secrets.json')
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')) as DevSecrets
  const made: DevSecrets = { authSecret: randomBytes(48).toString('base64'), dataKey: randomBytes(32).toString('base64') }
  mkdirSync(dir, { recursive: true })
  writeFileSync(file, JSON.stringify(made), { mode: 0o600 })
  return made
}

export interface Runtime {
  readonly app: ReturnType<typeof createApp>
  readonly config: Config
  readonly db: Db
}

export async function createRuntime(env: Record<string, string | undefined> = process.env): Promise<Runtime> {
  // Stand-in secrets exist only for a run that asked to be a development run.
  const config = loadConfig(env, env.RECO_ENV === 'development' ? devSecrets(DEV_DIR) : undefined)
  const db = config.databaseUrl ? await postgresDb(config.databaseUrl) : await pgliteDb(join(DEV_DIR, 'pg'))
  await migrate(db)
  const mailer = config.resendApiKey && config.fromEmail ? resendMailer(config.resendApiKey, config.fromEmail) : undefined
  return { app: createApp({ db, config, mailer, now: () => new Date(), log: jsonLog }), config, db }
}
