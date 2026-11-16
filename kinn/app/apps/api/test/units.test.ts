import { randomBytes } from 'node:crypto'

import { sampleCaseload, uploadableDataset } from '@reco/core'

import { loadConfig, ptAllowed } from '../src/config'
import { hashToken, keyedHash, newInviteCode, newSessionToken, newSignInCode, normaliseInviteCode, sameHash, seal, unseal } from '../src/crypto'
import { migrate, pgliteDb } from '../src/db'
import { MIGRATIONS } from '../src/migrations'
import { datasetSchema, planSchema } from '../src/schemas'

const secrets = { AUTH_SECRET: randomBytes(48).toString('base64'), DATA_KEY: randomBytes(32).toString('base64') }
const production = { RECO_ENV: 'production', ...secrets, DATABASE_URL: 'postgres://u:p@db.example/reco', RESEND_API_KEY: 'k', FROM_EMAIL: 'RECO <a@b.c>', CORS_ORIGINS: 'https://clinic.example', PT_ALLOWLIST: '@clinic.example' }

describe('what the server accepts', () => {
  test('every sample patient’s record, at every point the simulator can produce, fits the schema', () => {
    for (const today of ['2026-09-20', '2026-11-12', '2027-02-01']) {
      for (const p of sampleCaseload(today)) {
        const result = datasetSchema.safeParse(JSON.parse(JSON.stringify(uploadableDataset(p.data))))
        expect(result.success, `${p.id} ${today}: ${result.success ? '' : JSON.stringify(result.error.issues[0])}`).toBe(true)
      }
    }
  })

  test('the sample PT plans fit the plan schema', () => {
    const plans = sampleCaseload('2026-11-12').flatMap((p) => (p.data.ptPlan ? [p.data.ptPlan] : []))
    expect(plans.length).toBeGreaterThan(0)
    for (const plan of plans) expect(planSchema.safeParse(JSON.parse(JSON.stringify(plan))).success).toBe(true)
  })
})

describe('sealing records', () => {
  const key = randomBytes(32)

  test('a sealed value opens again with the same key and row', () => {
    const sealed = seal(key, 'dataset:abc', { profile: { name: 'Leo' }, n: [1, 2, 3] })
    expect(sealed).not.toContain('Leo')
    expect(unseal(key, 'dataset:abc', sealed)).toEqual({ profile: { name: 'Leo' }, n: [1, 2, 3] })
  })

  test('the same value seals differently each time', () => {
    expect(seal(key, 'x', { a: 1 })).not.toBe(seal(key, 'x', { a: 1 }))
  })

  test('it will not open under another key, on another patient’s row, or after being changed', () => {
    const sealed = seal(key, 'dataset:abc', { a: 1 })
    expect(() => unseal(randomBytes(32), 'dataset:abc', sealed)).toThrow()
    expect(() => unseal(key, 'dataset:someone-else', sealed)).toThrow()
    const parts = sealed.split('.')
    const flipped = Buffer.from(parts[3]!, 'base64')
    flipped[0] = flipped[0]! ^ 1
    expect(() => unseal(key, 'dataset:abc', [parts[0], parts[1], parts[2], flipped.toString('base64')].join('.'))).toThrow()
    expect(() => unseal(key, 'dataset:abc', 'not sealed')).toThrow()
  })
})

describe('codes and tokens', () => {
  test('sign-in codes are eight digits, sharing codes eight unambiguous characters, tokens long and unique', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(newSignInCode()).toMatch(/^\d{8}$/)
      expect(newInviteCode()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
    }
    expect(newSessionToken().length).toBeGreaterThanOrEqual(43)
    expect(newSessionToken()).not.toBe(newSessionToken())
    expect(hashToken('a')).toHaveLength(64)
  })

  test('a typed sharing code is read the way a person types it', () => {
    expect(normaliseInviteCode(' abcd-efgh ')).toBe('ABCDEFGH')
  })

  test('a code’s stored form depends on the secret and on what it is for', () => {
    const a = keyedHash('secret-one', 'code:patient:a@example.com', '123456')
    expect(sameHash(a, keyedHash('secret-one', 'code:patient:a@example.com', '123456'))).toBe(true)
    expect(sameHash(a, keyedHash('secret-two', 'code:patient:a@example.com', '123456'))).toBe(false)
    expect(sameHash(a, keyedHash('secret-one', 'code:pt:a@example.com', '123456'))).toBe(false)
    expect(sameHash(a, 'abcd')).toBe(false)
  })
})

describe('starting up', () => {
  test('production refuses to start with anything missing', () => {
    expect(() => loadConfig(production)).not.toThrow()
    for (const missing of ['AUTH_SECRET', 'DATA_KEY', 'DATABASE_URL', 'RESEND_API_KEY', 'FROM_EMAIL', 'CORS_ORIGINS'] as const) {
      expect(() => loadConfig({ ...production, [missing]: undefined }), missing).toThrow(/cannot start/)
    }
    expect(() => loadConfig({ ...production, AUTH_SECRET: 'short' })).toThrow(/AUTH_SECRET/)
    expect(() => loadConfig({ ...production, DATA_KEY: 'c2hvcnQ=' })).toThrow(/DATA_KEY/)
  })

  test('production never uses the local stand-in secrets and never hands a code back', () => {
    const dev = { authSecret: 'd'.repeat(40), dataKey: randomBytes(32).toString('base64') }
    expect(() => loadConfig({ RECO_ENV: 'production', DATABASE_URL: 'x', RESEND_API_KEY: 'k', FROM_EMAIL: 'f', CORS_ORIGINS: 'https://c.example' }, dev)).toThrow(/AUTH_SECRET/)
    expect(loadConfig(production).exposeDevCodes).toBe(false)
    expect(loadConfig({ VERCEL: '1', ...production, RECO_ENV: undefined })).toMatchObject({ env: 'production', trustProxy: true })
  })

  test('a local run needs no setup, but only when it says it is one', () => {
    const dev = { authSecret: 'd'.repeat(40), dataKey: randomBytes(32).toString('base64') }
    const config = loadConfig({ RECO_ENV: 'development' }, dev)
    expect(config).toMatchObject({ env: 'development', exposeDevCodes: true, port: 8787 })
    expect(config.corsOrigins).toContain('http://localhost:5174')
  })

  test('a host that says nothing about itself is treated as production', () => {
    const dev = { authSecret: 'd'.repeat(40), dataKey: randomBytes(32).toString('base64') }
    expect(() => loadConfig({}, dev)).toThrow(/cannot start/)
    expect(() => loadConfig({ NODE_ENV: 'development', DATABASE_URL: 'postgres://u:p@db.example/reco' }, dev)).toThrow(/AUTH_SECRET/)
    const hosted = loadConfig({ ...production, RECO_ENV: undefined })
    expect(hosted).toMatchObject({ env: 'production', exposeDevCodes: false })
    expect(ptAllowed({ env: hosted.env, ptAllowlist: [] }, 'anyone@example.com')).toBe(false)
  })

  test('PT accounts: the list in production, anyone on a laptop', () => {
    const config = loadConfig(production)
    expect(ptAllowed(config, 'dana@clinic.example')).toBe(true)
    expect(ptAllowed(config, 'dana@notclinic.example')).toBe(false)
    expect(ptAllowed({ env: 'production', ptAllowlist: [] }, 'dana@clinic.example')).toBe(false)
    expect(ptAllowed({ env: 'development', ptAllowlist: [] }, 'anyone@example.com')).toBe(true)
    expect(ptAllowed({ env: 'production', ptAllowlist: ['one@clinic.example'] }, 'two@clinic.example')).toBe(false)
  })
})

describe('the database steps', () => {
  test('run once, in order, and running them again changes nothing', async () => {
    const db = await pgliteDb()
    try {
      expect(await migrate(db)).toEqual(MIGRATIONS.map((m) => m.version))
      expect(await migrate(db)).toEqual([])
      const tables = (await db.query<{ table_name: string }>("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")).map((r) => r.table_name)
      expect(tables).toEqual(['access_log', 'accounts', 'datasets', 'invites', 'login_codes', 'plans', 'rate_limits', 'schema_migrations', 'sessions', 'shares'])
    } finally {
      await db.close()
    }
  })

  test('a failed transaction leaves nothing behind', async () => {
    const db = await pgliteDb()
    try {
      await migrate(db)
      await expect(db.transaction(async (tx) => {
        await tx.query("INSERT INTO accounts (id, email, role, created_at) VALUES (gen_random_uuid(), 'a@example.com', 'patient', now())")
        throw new Error('stop')
      })).rejects.toThrow('stop')
      expect(await db.query('SELECT 1 FROM accounts')).toEqual([])
    } finally {
      await db.close()
    }
  })
})
