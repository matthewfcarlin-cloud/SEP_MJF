/**
 * The RECO server's routes. Three rules hold everywhere:
 *
 *  1. The record belongs to the patient. A PT reads it only while the patient has a share
 *     turned on with them, only the parts the patient chose, and every read is written to a
 *     list the patient can see.
 *  2. The server stores facts and derives nothing. Status, flags, the protocol phase and
 *     RECO's own plan are worked out in the apps by @reco/core.
 *  3. Nothing is trusted on the way in: every body is checked against schemas.ts, and a plan
 *     also passes the same `validatePlan` the clinic editor runs.
 */
import { randomUUID } from 'node:crypto'

import { scopedDataset, uploadableDataset, validatePlan } from '@reco/core'
import type { Account, ApiErrorCode, Dataset, PublishedPlan, RecoveryPlan, SharedPatient, ShareView, StoredDataset } from '@reco/core'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { z } from 'zod'

import { ptAllowed } from './config'
import type { Config } from './config'
import { hashToken, keyedHash, newInviteCode, newSessionToken, newSignInCode, normaliseInviteCode, sameHash, seal, unseal } from './crypto'
import type { Db } from './db'
import { signInEmail, SIGN_IN_MINUTES } from './mail'
import type { Mailer } from './mail'
import { asDataset, asPlan, bodies } from './schemas'
import * as store from './store'
import type { AccountRow } from './store'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const LIMITS = {
  bodyBytes: 2 * 1024 * 1024,
  window: 15 * MINUTE,
  requestsPerAddress: 600,
  signInStartsPerAddress: 20,
  signInStartsPerEmail: 5,
  signInVerifiesPerAddress: 30,
  signInVerifiesPerEmail: 20,
  attemptsPerCode: 5,
  inviteTriesPerPatient: 10,
  invitesPerPtPerDay: 30,
  codeLifetime: SIGN_IN_MINUTES * MINUTE,
  inviteLifetime: 7 * DAY,
  /** A phone stays signed in for a month; a clinic browser for one working day. */
  sessionLifetime: { patient: 30 * DAY, pt: 12 * HOUR },
  viewLogQuiet: HOUR,
  accessLogShown: 100,
} as const

export interface Logger {
  error(message: string, detail?: Record<string, unknown>): void
}

export interface Deps {
  readonly db: Db
  readonly config: Config
  /** Missing in a local run, where the code is handed back in the response instead. */
  readonly mailer: Mailer | undefined
  readonly now: () => Date
  readonly log: Logger
}

class HttpError extends Error {
  constructor(readonly status: ContentfulStatusCode, readonly code: ApiErrorCode, message: string) {
    super(message)
  }
}

const bad = (message: string): HttpError => new HttpError(400, 'bad-request', message)
const SIGN_IN_FAILED = 'That code didn’t work. Check the latest email, or ask for a new code.'
const SHARE_OFF = 'That share isn’t on.'
const NOT_SHARED = 'This patient isn’t sharing with you.'
const UNIQUE_VIOLATION = '23505'

type Env = { Variables: { account: AccountRow; tokenHash: string }; Bindings: { incoming?: { socket?: { remoteAddress?: string } } } }
type Ctx = Context<Env>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** The `:id` in the address, if it is shaped like one of ours. Anything else never reaches the database. */
const idParam = (c: Ctx): string | undefined => {
  const raw = c.req.param('id') ?? ''
  return UUID.test(raw) ? raw : undefined
}

const ok = <T>(c: Ctx, data: T, status: ContentfulStatusCode = 200): Response => c.json({ success: true, data }, status)

const publicAccount = (a: AccountRow): Account => ({ id: a.id, email: a.email, role: a.role, name: a.name })

export function createApp(deps: Deps): Hono<Env> {
  const { db, config, now } = deps
  const app = new Hono<Env>()

  /**
   * The caller's address, for rate limits. Behind a proxy, X-Forwarded-For is a list the caller
   * can prepend anything to; only the last entry was written by the proxy we trust.
   */
  const address = (c: Ctx): string => {
    const forwarded = config.trustProxy ? c.req.header('x-forwarded-for')?.split(',').at(-1)?.trim() : undefined
    return forwarded || c.env?.incoming?.socket?.remoteAddress || 'local'
  }

  const limit = async (key: string, max: number, windowMs: number = LIMITS.window): Promise<void> => {
    if ((await store.hit(db, key, now(), windowMs)) > max) throw new HttpError(429, 'too-many-requests', 'Too many tries. Wait a few minutes and try again.')
  }

  const read = async <S extends z.ZodTypeAny>(c: Ctx, schema: S): Promise<z.infer<S>> => {
    let raw: unknown
    try {
      raw = await c.req.json()
    } catch {
      throw bad('The request wasn’t valid JSON.')
    }
    const parsed = schema.safeParse(raw)
    if (parsed.success) return parsed.data
    const issue = parsed.error.issues[0]
    throw bad(`${issue?.path.join('.') || 'request'}: ${issue?.message ?? 'not valid'}`)
  }

  const sealContext = { dataset: (patientId: string) => `dataset:${patientId}`, plan: (patientId: string, version: number) => `plan:${patientId}:${version}` }
  const openDataset = (patientId: string, payload: string): Dataset => unseal(config.dataKey, sealContext.dataset(patientId), payload) as Dataset
  const openPlan = (patientId: string, row: { version: number; payload: string }): RecoveryPlan => unseal(config.dataKey, sealContext.plan(patientId, row.version), row.payload) as RecoveryPlan

  // ---- every request ----

  app.use('*', secureHeaders())
  app.use('*', cors({
    origin: (origin) => (config.corsOrigins.includes(origin.toLowerCase()) ? origin : null),
    allowHeaders: ['authorization', 'content-type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxAge: 600,
  }))
  app.use('/v1/*', bodyLimit({ maxSize: LIMITS.bodyBytes, onError: () => { throw new HttpError(413, 'too-large', 'That’s more than the server takes in one request.') } }))
  app.use('/v1/*', async (c, next) => {
    // Health data: never cached by a browser or anything in between.
    c.header('cache-control', 'no-store')
    await limit(`addr:${address(c)}`, LIMITS.requestsPerAddress)
    await next()
  })

  app.get('/healthz', (c) => ok(c, { ok: true, store: db.kind }))

  // ---- signing in: email, then a one-time code ----

  app.post('/v1/auth/start', async (c) => {
    const { email, role } = await read(c, bodies.authStart)
    await limit(`start-addr:${address(c)}`, LIMITS.signInStartsPerAddress)
    await limit(`start-email:${email}`, LIMITS.signInStartsPerEmail)
    if (role === 'pt' && !ptAllowed(config, email)) throw new HttpError(403, 'forbidden', 'PT accounts are by invitation while RECO is in its pilot. Write to the RECO team to get one.')
    const code = newSignInCode()
    const at = now()
    await store.replaceLoginCode(db, { id: randomUUID(), email, role, codeHash: keyedHash(config.authSecret, `code:${role}:${email}`, code), expiresAt: new Date(at.getTime() + LIMITS.codeLifetime) }, at)
    if (deps.mailer) {
      try {
        await deps.mailer.send({ to: email, ...signInEmail(code) })
      } catch (error) {
        deps.log.error('sign-in email failed', { reason: error instanceof Error ? error.message : 'unknown' })
        throw new HttpError(503, 'unavailable', 'The sign-in email couldn’t be sent. Try again in a minute.')
      }
    } else if (!config.exposeDevCodes) {
      throw new HttpError(503, 'unavailable', 'Sign-in email isn’t set up on this server.')
    }
    // The same answer whether or not the email has an account.
    return ok(c, { sent: true, ...(config.exposeDevCodes ? { devCode: code } : {}) })
  })

  app.post('/v1/auth/verify', async (c) => {
    const { email, role, code, name } = await read(c, bodies.authVerify)
    await limit(`verify-addr:${address(c)}`, LIMITS.signInVerifiesPerAddress)
    // Guesses are also counted per email, across codes, so asking for fresh codes buys no extra tries.
    await limit(`verify-email:${role}:${email}`, LIMITS.signInVerifiesPerEmail, HOUR)
    const at = now()
    const live = await store.countLoginAttempt(db, email, role, at)
    const matches = live !== undefined && live.attempts <= LIMITS.attemptsPerCode && sameHash(live.codeHash, keyedHash(config.authSecret, `code:${role}:${email}`, code))
    if (!live || !matches) throw new HttpError(401, 'unauthorized', SIGN_IN_FAILED)
    if (role === 'pt' && !ptAllowed(config, email)) throw new HttpError(403, 'forbidden', 'This email can’t open a PT account.')

    const token = newSessionToken()
    const account = await db.transaction(async (tx) => {
      if (!(await store.consumeLoginCode(tx, live.id, at))) throw new HttpError(401, 'unauthorized', SIGN_IN_FAILED)
      const existing = await store.findAccountByEmail(tx, email)
      // Said only after the caller has proved the email is theirs.
      if (existing && existing.role !== role) throw new HttpError(403, 'forbidden', role === 'pt' ? 'This email is a RECO patient account. Use a different email for the clinic site.' : 'This email is a RECO clinic account. Use a different email in the app.')
      const found = existing ?? (await store.createAccount(tx, { id: randomUUID(), email, role, name: name?.trim() ?? '' }, at))
      await store.createSession(tx, { id: randomUUID(), accountId: found.id, tokenHash: hashToken(token), expiresAt: new Date(at.getTime() + LIMITS.sessionLifetime[role]) }, at)
      return found
    })
    return ok(c, { token, account: publicAccount(account) })
  })

  // ---- signed-in routes ----

  const signedIn = async (c: Ctx, next: () => Promise<void>): Promise<void> => {
    const header = c.req.header('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
    const tokenHash = token ? hashToken(token) : ''
    const account = tokenHash ? await store.findSessionAccount(db, tokenHash, now()) : undefined
    if (!account) throw new HttpError(401, 'unauthorized', 'Sign in again to carry on.')
    c.set('account', account)
    c.set('tokenHash', tokenHash)
    await next()
  }
  const only = (role: Account['role']) => async (c: Ctx, next: () => Promise<void>): Promise<void> => {
    if (c.get('account').role !== role) throw new HttpError(403, 'forbidden', role === 'pt' ? 'This is for PT accounts.' : 'This is for the patient’s own account.')
    await next()
  }
  const patient = only('patient')
  const pt = only('pt')

  app.use('/v1/me', signedIn)
  app.use('/v1/me/*', signedIn)
  app.use('/v1/auth/logout', signedIn)
  app.use('/v1/invites', signedIn)
  app.use('/v1/patients', signedIn)
  app.use('/v1/patients/*', signedIn)

  app.post('/v1/auth/logout', async (c) => {
    await store.deleteSession(db, c.get('tokenHash'))
    return ok(c, null)
  })

  app.get('/v1/me', (c) => ok(c, publicAccount(c.get('account'))))

  app.patch('/v1/me', async (c) => {
    const { name } = await read(c, bodies.rename)
    await store.renameAccount(db, c.get('account').id, name)
    return ok(c, publicAccount({ ...c.get('account'), name }))
  })

  /** Delete my data: the account and everything stored under it, in one step. */
  app.delete('/v1/me', async (c) => {
    await db.transaction((tx) => store.deleteAccount(tx, c.get('account')))
    return ok(c, null)
  })

  // ---- the patient's own record ----

  app.get('/v1/me/dataset', patient, async (c) => {
    const me = c.get('account')
    const row = await store.getDataset(db, me.id)
    const body: StoredDataset | null = row ? { revision: row.revision, data: openDataset(me.id, row.payload), updatedAt: row.updatedAt } : null
    return ok(c, body)
  })

  app.put('/v1/me/dataset', patient, async (c) => {
    const me = c.get('account')
    const { baseRevision, data } = await read(c, bodies.putDataset)
    const payload = seal(config.dataKey, sealContext.dataset(me.id), uploadableDataset(asDataset(data)))
    const revision = await store.saveDataset(db, me.id, baseRevision, payload, now())
    if (revision === undefined) {
      const current = await store.getDataset(db, me.id)
      return c.json({ success: false, code: 'conflict', error: 'The record on the server is newer than this copy.', revision: current?.revision ?? 0 }, 409)
    }
    return ok(c, { revision })
  })

  // ---- sharing: the patient's choice ----

  const shareView = (s: store.ShareRow): ShareView => ({ id: s.id, pt: s.pt, scopes: s.scopes, since: s.since })

  const openInvite = async (c: Ctx, rawCode: string): Promise<{ id: string; pt: AccountRow }> => {
    await limit(`invite-try:${c.get('account').id}`, LIMITS.inviteTriesPerPatient)
    const invite = await store.findOpenInvite(db, keyedHash(config.authSecret, 'invite', normaliseInviteCode(rawCode)), now())
    if (!invite) throw new HttpError(404, 'not-found', 'That sharing code isn’t valid. Codes work once and last 7 days; ask your PT for a new one.')
    return invite
  }

  app.get('/v1/me/shares', patient, async (c) => ok(c, (await store.listShares(db, c.get('account').id)).map(shareView)))

  /** Shows who a code belongs to, so the patient sees the PT's name before agreeing to anything. */
  app.post('/v1/me/shares/preview', patient, async (c) => {
    const { code } = await read(c, bodies.invitePreview)
    const invite = await openInvite(c, code)
    return ok(c, { pt: { name: invite.pt.name, email: invite.pt.email } })
  })

  app.post('/v1/me/shares', patient, async (c) => {
    const me = c.get('account')
    const { code, scopes } = await read(c, bodies.acceptInvite)
    const invite = await openInvite(c, code)
    const at = now()
    const shareId = await db.transaction(async (tx) => {
      if (!(await store.markInviteAccepted(tx, invite.id, me.id, at))) throw new HttpError(404, 'not-found', 'That sharing code has already been used.')
      return store.upsertShare(tx, { id: randomUUID(), patientId: me.id, ptId: invite.pt.id, scopes }, at)
    })
    const share = await store.findShare(db, shareId, me.id)
    if (!share) throw new HttpError(500, 'server-error', 'The share was not saved.')
    return ok(c, shareView(share), 201)
  })

  app.patch('/v1/me/shares/:id', patient, async (c) => {
    const me = c.get('account')
    const { scopes } = await read(c, bodies.setScopes)
    const shareId = idParam(c)
    if (shareId) await store.setShareScopes(db, shareId, me.id, scopes)
    const share = shareId ? await store.findShare(db, shareId, me.id) : undefined
    if (!share) throw new HttpError(404, 'not-found', SHARE_OFF)
    return ok(c, shareView(share))
  })

  /** Stop sharing. The PT loses access at once; plans they already published stay with the patient. */
  app.delete('/v1/me/shares/:id', patient, async (c) => {
    const shareId = idParam(c)
    const revoked = shareId ? await store.revokeShare(db, shareId, c.get('account').id, now()) : false
    if (!revoked) throw new HttpError(404, 'not-found', SHARE_OFF)
    return ok(c, null)
  })

  app.get('/v1/me/plan', patient, async (c) => {
    const me = c.get('account')
    const row = await store.latestPlan(db, me.id)
    const body: PublishedPlan | null = row ? { plan: openPlan(me.id, row), publishedAt: row.publishedAt } : null
    return ok(c, body)
  })

  app.get('/v1/me/access-log', patient, async (c) => ok(c, await store.listAccess(db, c.get('account').id, LIMITS.accessLogShown)))

  // ---- the PT side ----

  app.post('/v1/invites', pt, async (c) => {
    const me = c.get('account')
    if (me.name.trim() === '') throw bad('Add your name first, as patients will see it.')
    await limit(`invites:${me.id}`, LIMITS.invitesPerPtPerDay, DAY)
    const code = newInviteCode()
    const at = now()
    const expiresAt = new Date(at.getTime() + LIMITS.inviteLifetime)
    await store.createInvite(db, { id: randomUUID(), ptId: me.id, codeHash: keyedHash(config.authSecret, 'invite', code), expiresAt }, at)
    return ok(c, { code, expiresAt: expiresAt.toISOString() }, 201)
  })

  /** The PT's caseload: each sharing patient's record, cut down to what that patient chose to share. */
  app.get('/v1/patients', pt, async (c) => {
    const me = c.get('account')
    const rows = await store.caseload(db, me.id)
    await store.logCaseloadView(db, me, now(), LIMITS.viewLogQuiet)
    const patients: SharedPatient[] = rows.map((r) => {
      const base = { id: r.patientId, sharedSince: r.sharedSince, scopes: r.scopes }
      try {
        const record = r.dataset ? scopedDataset(openDataset(r.patientId, r.dataset.payload), r.scopes) : undefined
        const plan = r.plan ? openPlan(r.patientId, r.plan) : undefined
        const data = record ? { ...record, ...(plan ? { ptPlan: plan } : {}) } : undefined
        return { ...base, name: record?.profile.name || r.accountName, ...(r.dataset ? { updatedAt: r.dataset.updatedAt } : {}), ...(data ? { data } : {}) }
      } catch (error) {
        // One record that won't open (a damaged row, a changed key) must not hide everyone else.
        deps.log.error('a stored record could not be opened', { patient: r.patientId, reason: error instanceof Error ? error.message : 'unknown' })
        return { ...base, name: r.accountName, unreadable: true }
      }
    })
    return ok(c, patients)
  })

  const sharingPatient = async (c: Ctx): Promise<string> => {
    const patientId = idParam(c)
    // A malformed id gets the same answer as a patient who isn't sharing: no hint either way.
    const share = patientId ? await store.activeShare(db, c.get('account').id, patientId) : undefined
    if (!patientId || !share) throw new HttpError(403, 'forbidden', NOT_SHARED)
    return patientId
  }

  app.get('/v1/patients/:id/plans', pt, async (c) => {
    const patientId = await sharingPatient(c)
    await store.logPatientView(db, c.get('account'), patientId, now(), LIMITS.viewLogQuiet)
    const plans: PublishedPlan[] = (await store.listPlans(db, patientId)).map((row) => ({ plan: openPlan(patientId, row), publishedAt: row.publishedAt }))
    return ok(c, plans)
  })

  /** Publish the next version of a patient's plan. Versions are never edited; each publish adds one. */
  app.post('/v1/patients/:id/plans', pt, async (c) => {
    const me = c.get('account')
    const patientId = await sharingPatient(c)
    const draft = asPlan((await read(c, bodies.publishPlan)).plan)
    // The author is who is signed in, whatever the request says.
    const plan: RecoveryPlan = { ...draft, author: { kind: 'pt', name: me.name } }
    const problems = validatePlan(plan)
    if (plan.entries.length === 0) throw bad('Add at least one exercise before publishing.')
    if (problems.length > 0) throw bad(problems.join('. '))
    const at = now()
    try {
      await db.transaction(async (tx) => {
        const latest = (await store.latestPlan(tx, patientId))?.version ?? 0
        if (plan.version !== latest + 1) throw new HttpError(409, 'conflict', `Version ${latest} is the one in use, so the next one is ${latest + 1}. Reload the plan and publish again.`)
        await store.insertPlan(tx, { id: randomUUID(), patientId, ptId: me.id, version: plan.version, payload: seal(config.dataKey, sealContext.plan(patientId, plan.version), plan) }, at)
        await store.logAccess(tx, { id: randomUUID(), patientId, ptId: me.id, ptName: me.name, action: 'published-plan' }, at)
      })
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) throw new HttpError(409, 'conflict', 'Another version was published a moment ago. Reload the plan and publish again.')
      throw error
    }
    const published: PublishedPlan = { plan, publishedAt: at.toISOString() }
    return ok(c, published, 201)
  })

  // ---- errors ----

  app.notFound((c) => c.json({ success: false, code: 'not-found', error: 'There’s nothing at this address.' }, 404))
  app.onError((error, c) => {
    if (error instanceof HttpError) return c.json({ success: false, code: error.code, error: error.message }, error.status)
    // Never the request body, a token or a record: only where it happened and what kind of failure.
    deps.log.error('request failed', { method: c.req.method, path: c.req.routePath, reason: error instanceof Error ? error.message : 'unknown' })
    return c.json({ success: false, code: 'server-error', error: 'Something went wrong on RECO’s side. Try again.' }, 500)
  })

  return app
}
