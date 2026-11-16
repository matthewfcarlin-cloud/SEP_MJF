import { ApiError } from '@reco/core'

import { LIMITS } from '../src/app'
import { createHarness } from './harness'
import type { Harness } from './harness'

let h: Harness
beforeAll(async () => { h = await createHarness() })
afterAll(async () => { await h.close() })
beforeEach(async () => { await h.reset() })

const failure = async (p: Promise<unknown>): Promise<ApiError> => {
  try {
    await p
  } catch (e) {
    if (e instanceof ApiError) return e
    throw e
  }
  throw new Error('expected the call to be refused')
}

describe('signing in with an emailed code', () => {
  test('the right code opens a session; the account is made on first sign-in and found again after', async () => {
    const first = await h.signIn('Maya@Example.com', 'patient', 'Maya')
    expect(first.account).toMatchObject({ email: 'maya@example.com', role: 'patient', name: 'Maya' })
    expect(await first.api.me()).toEqual(first.account)
    const again = await h.signIn('maya@example.com', 'patient')
    expect(again.account.id).toBe(first.account.id)
    expect(again.token).not.toBe(first.token)
  })

  test('the answer to "send me a code" is the same whether or not the email has an account', async () => {
    await h.signIn('known@example.com', 'patient')
    const known = await h.request('POST', '/v1/auth/start', { body: { email: 'known@example.com', role: 'patient' } })
    const unknown = await h.request('POST', '/v1/auth/start', { body: { email: 'nobody@example.com', role: 'patient' } })
    expect(Object.keys(known.body.data)).toEqual(Object.keys(unknown.body.data))
    expect(known.status).toBe(unknown.status)
  })

  test('a wrong code is refused, and five wrong guesses kill the code even for the right one', async () => {
    const api = h.anonymous()
    const { devCode } = await api.startSignIn('a@example.com', 'patient')
    const wrong = devCode === '00000000' ? '11111111' : '00000000'
    for (let i = 0; i < LIMITS.attemptsPerCode; i += 1) expect((await failure(api.verifySignIn({ email: 'a@example.com', role: 'patient', code: wrong }))).status).toBe(401)
    expect((await failure(api.verifySignIn({ email: 'a@example.com', role: 'patient', code: devCode! }))).status).toBe(401)
  })

  test('a code works once, only for its own email and role, and only for ten minutes', async () => {
    const api = h.anonymous()
    const a = await api.startSignIn('a@example.com', 'patient')
    await api.verifySignIn({ email: 'a@example.com', role: 'patient', code: a.devCode! })
    expect((await failure(api.verifySignIn({ email: 'a@example.com', role: 'patient', code: a.devCode! }))).status).toBe(401)

    const b = await api.startSignIn('b@example.com', 'patient')
    expect((await failure(api.verifySignIn({ email: 'c@example.com', role: 'patient', code: b.devCode! }))).status).toBe(401)
    expect((await failure(api.verifySignIn({ email: 'b@example.com', role: 'pt', code: b.devCode! }))).status).toBe(401)

    const d = await api.startSignIn('d@example.com', 'patient')
    h.advance(LIMITS.codeLifetime + 1000)
    expect((await failure(api.verifySignIn({ email: 'd@example.com', role: 'patient', code: d.devCode! }))).status).toBe(401)
  })

  test('asking for a new code retires the old one', async () => {
    const api = h.anonymous()
    const first = await api.startSignIn('a@example.com', 'patient')
    const second = await api.startSignIn('a@example.com', 'patient')
    if (first.devCode !== second.devCode) expect((await failure(api.verifySignIn({ email: 'a@example.com', role: 'patient', code: first.devCode! }))).status).toBe(401)
    await expect(api.verifySignIn({ email: 'a@example.com', role: 'patient', code: second.devCode! })).resolves.toBeDefined()
  })

  test('one email is one kind of account', async () => {
    await h.signIn('both@example.com', 'patient')
    const { devCode } = await h.anonymous().startSignIn('both@example.com', 'pt')
    const refused = await failure(h.anonymous().verifySignIn({ email: 'both@example.com', role: 'pt', code: devCode! }))
    expect(refused.status).toBe(403)
    expect(refused.message).toContain('patient account')
  })

  test('codes per email and per address are limited', async () => {
    const api = h.anonymous()
    for (let i = 0; i < LIMITS.signInStartsPerEmail; i += 1) await api.startSignIn('a@example.com', 'patient')
    expect((await failure(api.startSignIn('a@example.com', 'patient'))).status).toBe(429)
    h.advance(LIMITS.window + 1000)
    await expect(api.startSignIn('a@example.com', 'patient')).resolves.toBeDefined()
  })

  test('guesses are counted per email across codes, so fresh codes buy no extra tries', async () => {
    const api = h.anonymous()
    let refused = 0
    for (let round = 0; round < 6 && refused !== 429; round += 1) {
      const { devCode } = await api.startSignIn(`a${round % 2}@example.com`, 'patient').catch(() => ({ devCode: undefined }))
      const wrong = devCode === '00000000' ? '11111111' : '00000000'
      for (let i = 0; i < LIMITS.attemptsPerCode && refused !== 429; i += 1) refused = (await failure(api.verifySignIn({ email: 'a0@example.com', role: 'patient', code: wrong }))).status
    }
    expect(refused).toBe(429)
  })

  test('signing out ends the session, and a session ends by itself: a month on a phone, a working day at a clinic', async () => {
    const patient = await h.signIn('p@example.com', 'patient')
    await patient.api.signOut()
    expect((await failure(patient.api.me())).status).toBe(401)

    const again = await h.signIn('p@example.com', 'patient')
    const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')
    h.advance(LIMITS.sessionLifetime.pt + 1000)
    expect((await failure(pt.api.me())).status).toBe(401)
    await expect(again.api.me()).resolves.toBeDefined()
    h.advance(LIMITS.sessionLifetime.patient)
    expect((await failure(again.api.me())).status).toBe(401)
  })

  test('nothing works without a session, and a made-up token is not one', async () => {
    for (const [method, path] of [['GET', '/v1/me'], ['GET', '/v1/me/dataset'], ['GET', '/v1/patients'], ['POST', '/v1/invites'], ['POST', '/v1/auth/logout'], ['GET', '/v1/me/plan']] as const) {
      expect((await h.request(method, path)).status, path).toBe(401)
      expect((await h.request(method, path, { token: 'not-a-real-token' })).status, path).toBe(401)
    }
  })

  test('bad input is refused with a plain reason', async () => {
    expect((await h.request('POST', '/v1/auth/start', { body: { email: 'not-an-email', role: 'patient' } })).status).toBe(400)
    expect((await h.request('POST', '/v1/auth/start', { body: { email: 'a@example.com', role: 'admin' } })).status).toBe(400)
    expect((await h.request('POST', '/v1/auth/start', { body: '{not json' })).status).toBe(400)
    expect((await h.request('POST', '/v1/auth/verify', { body: { email: 'a@example.com', role: 'patient', code: '123456' } })).status).toBe(400)
    expect((await h.request('POST', '/v1/auth/start', { body: { email: 'a@example.com', role: 'patient', admin: true } })).status).toBe(400)
  })

  test('only the hash of a code or a session is ever stored', async () => {
    const { token } = await h.signIn('a@example.com', 'patient')
    const { devCode } = await h.anonymous().startSignIn('a@example.com', 'patient')
    const stored = JSON.stringify([await h.db.query('SELECT * FROM sessions'), await h.db.query('SELECT * FROM login_codes')])
    expect(stored).not.toContain(token)
    expect(stored).not.toContain(`"${devCode}"`)
  })
})

describe('who can open a PT account', () => {
  let limited: Harness
  beforeAll(async () => { limited = await createHarness({ PT_ALLOWLIST: 'dana@clinic.example, @partnerclinic.example' }) })
  afterAll(async () => { await limited.close() })

  test('only emails and domains on the list; patients are never limited', async () => {
    await expect(limited.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')).resolves.toBeDefined()
    await expect(limited.signIn('lee@partnerclinic.example', 'pt', 'Lee Park, PT')).resolves.toBeDefined()
    const refused = await failure(limited.anonymous().startSignIn('stranger@elsewhere.example', 'pt'))
    expect(refused.status).toBe(403)
    await expect(limited.signIn('stranger@elsewhere.example', 'patient')).resolves.toBeDefined()
  })
})

describe('sign-in email', () => {
  let mailed: Harness
  beforeAll(async () => { mailed = await createHarness({ RESEND_API_KEY: 'test-key-not-real', FROM_EMAIL: 'RECO <hello@reco.test>' }) })
  afterAll(async () => { await mailed.close() })

  test('with email set up, the code goes to the inbox and never comes back in the response', async () => {
    const response = await mailed.request('POST', '/v1/auth/start', { body: { email: 'a@example.com', role: 'patient' } })
    expect(response.body.data).toEqual({ sent: true })
    expect(mailed.sent).toHaveLength(1)
    const code = /\b(\d{8})\b/.exec(mailed.sent[0]!.text)?.[1]
    expect(code).toBeDefined()
    expect(mailed.sent[0]!.text).toContain('not a medical device')
    await expect(mailed.anonymous().verifySignIn({ email: 'a@example.com', role: 'patient', code: code! })).resolves.toBeDefined()
  })
})
