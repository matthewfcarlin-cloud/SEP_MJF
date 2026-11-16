/**
 * Everything the server reads from its environment, checked once at startup. Production is the
 * default: a host that sets nothing gets the strict rules, and every secret must be present or
 * the server refuses to start. Development (stand-in secrets, sign-in codes handed back in the
 * response, anyone may open a PT account) happens only when RECO_ENV says so.
 */
import { z } from 'zod'

const MIN_SECRET_LENGTH = 32
const DATA_KEY_BYTES = 32
const DEFAULT_PORT = 8787

const list = (raw: string | undefined): readonly string[] =>
  (raw ?? '').split(',').map((s) => s.trim().toLowerCase()).filter((s) => s !== '')

export interface Config {
  readonly env: 'production' | 'development' | 'test'
  readonly port: number
  readonly databaseUrl: string | undefined
  readonly authSecret: string
  /** 32 bytes. */
  readonly dataKey: Buffer
  readonly resendApiKey: string | undefined
  readonly fromEmail: string | undefined
  /** Emails and @domains allowed to open a PT account. Empty in development means anyone. */
  readonly ptAllowlist: readonly string[]
  readonly corsOrigins: readonly string[]
  /** Read the caller's address from X-Forwarded-For. Only behind a proxy that sets it. */
  readonly trustProxy: boolean
  /** Hand the sign-in code back in the response. Never in production. */
  readonly exposeDevCodes: boolean
}

const envSchema = z.object({
  RECO_ENV: z.enum(['production', 'development', 'test']).optional(),
  VERCEL: z.string().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().optional(),
  DATA_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  FROM_EMAIL: z.string().min(1).optional(),
  PT_ALLOWLIST: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  TRUST_PROXY: z.enum(['true', 'false']).optional(),
})

export interface DevSecrets {
  readonly authSecret: string
  readonly dataKey: string
}

const DEV_ORIGINS = ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:8081', 'http://localhost:19006']

/**
 * @param devSecrets used only outside production when AUTH_SECRET or DATA_KEY is unset, so a
 * local run needs no setup. The caller generates and keeps them (see dev-secrets.ts).
 */
export function loadConfig(source: Record<string, string | undefined>, devSecrets?: DevSecrets): Config {
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) throw new Error(`RECO server: bad environment. ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
  const e = parsed.data
  const env = e.RECO_ENV ?? 'production'
  const production = env === 'production'

  const authSecret = e.AUTH_SECRET ?? (production ? undefined : devSecrets?.authSecret)
  const dataKeyRaw = e.DATA_KEY ?? (production ? undefined : devSecrets?.dataKey)
  const problems: string[] = []
  if (!authSecret || authSecret.length < MIN_SECRET_LENGTH) problems.push(`AUTH_SECRET must be set, ${MIN_SECRET_LENGTH}+ characters`)
  const dataKey = dataKeyRaw ? Buffer.from(dataKeyRaw, 'base64') : undefined
  if (!dataKey || dataKey.length !== DATA_KEY_BYTES) problems.push(`DATA_KEY must be ${DATA_KEY_BYTES} random bytes, base64`)
  const ptAllowlist = list(e.PT_ALLOWLIST)
  const corsOrigins = list(e.CORS_ORIGINS)
  if (production) {
    if (!e.DATABASE_URL) problems.push('DATABASE_URL must be set')
    if (!e.RESEND_API_KEY || !e.FROM_EMAIL) problems.push('RESEND_API_KEY and FROM_EMAIL must be set, or nobody can sign in')
    if (corsOrigins.length === 0) problems.push('CORS_ORIGINS must name the clinic site')
  }
  if (problems.length > 0 || !authSecret || !dataKey) throw new Error(`RECO server: cannot start. ${problems.join('. ')}.`)

  return {
    env,
    port: e.PORT ?? DEFAULT_PORT,
    databaseUrl: e.DATABASE_URL,
    authSecret,
    dataKey,
    resendApiKey: e.RESEND_API_KEY,
    fromEmail: e.FROM_EMAIL,
    ptAllowlist,
    corsOrigins: corsOrigins.length > 0 ? corsOrigins : production ? [] : DEV_ORIGINS,
    trustProxy: e.TRUST_PROXY !== undefined ? e.TRUST_PROXY === 'true' : Boolean(e.VERCEL),
    exposeDevCodes: !production && !e.RESEND_API_KEY,
  }
}

/** Whether this email may open a PT account. An empty list means anyone, which only development allows. */
export function ptAllowed(config: Pick<Config, 'ptAllowlist' | 'env'>, email: string): boolean {
  if (config.ptAllowlist.length === 0) return config.env !== 'production'
  const domain = email.slice(email.lastIndexOf('@'))
  return config.ptAllowlist.some((entry) => (entry.startsWith('@') ? entry === domain : entry === email))
}
