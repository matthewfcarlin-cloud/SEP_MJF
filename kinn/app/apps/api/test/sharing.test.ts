import { ApiError, DEFAULT_SHARE_SCOPES, deriveToday, patientSummary, resolvePlan, sampleCaseload, uploadableDataset } from '@reco/core'
import type { ApiClient, Dataset, RecoveryPlan } from '@reco/core'

import { LIMITS } from '../src/app'
import { createHarness, START } from './harness'
import type { Harness } from './harness'

let h: Harness
beforeAll(async () => { h = await createHarness() })
afterAll(async () => { await h.close() })
beforeEach(async () => { await h.reset() })

const TODAY = '2026-11-15'
const sample = (id: string): Dataset => uploadableDataset(sampleCaseload(TODAY).find((p) => p.id === id)!.data)
const LEO = sample('leo-flare')

const failure = async (p: Promise<unknown>): Promise<ApiError> => {
  try {
    await p
  } catch (e) {
    if (e instanceof ApiError) return e
    throw e
  }
  throw new Error('expected the call to be refused')
}

const plan = (version: number, patch: Partial<RecoveryPlan> = {}): RecoveryPlan => ({
  id: `plan-${version}`,
  version,
  author: { kind: 'pt', name: 'Someone Else' },
  adaptation: 'lighter-on-flare',
  publishedOn: TODAY,
  entries: [
    { id: 'e1', source: { kind: 'library', exerciseId: 'mini-squat' }, name: 'Mini squats', dose: { sets: 3, reps: 12 }, lightDose: { sets: 2, reps: 10 }, daysPerWeek: 7 },
    { id: 'e2', source: { kind: 'custom' }, name: 'Wall sit', dose: { sets: 3, seconds: 30 }, daysPerWeek: 3 },
  ],
  ...patch,
})

/** A patient with a synced record, a PT, and a share between them. */
async function linked(scopes = DEFAULT_SHARE_SCOPES): Promise<{ patient: ApiClient; pt: ApiClient; patientId: string; shareId: string }> {
  const patient = await h.signIn('leo@example.com', 'patient', 'Leo')
  const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')
  await patient.api.putDataset(0, LEO)
  const { code } = await pt.api.createInvite()
  const share = await patient.api.acceptInvite(code, scopes)
  return { patient: patient.api, pt: pt.api, patientId: patient.account.id, shareId: share.id }
}

describe('the patient’s own record', () => {
  test('goes up, comes back the same, and counts its revisions', async () => {
    const { api } = await h.signIn('leo@example.com', 'patient')
    expect(await api.getDataset()).toBeNull()
    expect(await api.putDataset(0, LEO)).toEqual({ revision: 1 })
    expect(await api.putDataset(1, { ...LEO, checkIns: [...LEO.checkIns, { date: TODAY, pain: 2, swelling: 'none' }] })).toEqual({ revision: 2 })
    const stored = await api.getDataset()
    expect(stored?.revision).toBe(2)
    expect(stored?.data.checkIns.at(-1)).toEqual({ date: TODAY, pain: 2, swelling: 'none' })
    expect(stored?.data.profile).toEqual(LEO.profile)
  })

  test('a copy older than the server’s is refused, and told the revision to start from', async () => {
    const { api, token } = await h.signIn('leo@example.com', 'patient')
    await api.putDataset(0, LEO)
    await api.putDataset(1, LEO)
    expect((await failure(api.putDataset(1, LEO))).status).toBe(409)
    expect((await failure(api.putDataset(0, LEO))).status).toBe(409)
    const raw = await h.request('PUT', '/v1/me/dataset', { token, body: { baseRevision: 1, data: LEO } })
    expect(raw.body).toMatchObject({ success: false, code: 'conflict', revision: 2 })
  })

  test('it is sealed in the database: the stored row shows nothing of the record', async () => {
    const { api } = await h.signIn('leo@example.com', 'patient')
    await api.putDataset(0, { ...LEO, profile: { ...LEO.profile, goal: 'Back on the pitch by spring' } })
    const [row] = await h.db.query<{ payload: string }>('SELECT payload FROM datasets')
    expect(row?.payload.startsWith('v1.')).toBe(true)
    expect(row?.payload).not.toContain('pitch')
    expect(row?.payload).not.toContain(LEO.profile.name)
  })

  test('a field the server doesn’t know, a file from the phone or a nonsense value is refused whole', async () => {
    const { token } = await h.signIn('leo@example.com', 'patient')
    const put = (data: unknown) => h.request('PUT', '/v1/me/dataset', { token, body: { baseRevision: 0, data } })
    expect((await put({ ...LEO, surprise: true })).status).toBe(400)
    expect((await put({ ...LEO, painLogs: [{ id: 'x', t: 1, date: TODAY, voiceUri: 'file:///voice.m4a' }] })).status).toBe(400)
    expect((await put({ ...LEO, checkIns: [{ date: TODAY, pain: 11, swelling: 'none' }] })).status).toBe(400)
    expect((await put({ ...LEO, checkIns: [{ date: 'yesterday', pain: 3, swelling: 'none' }] })).status).toBe(400)
    expect((await put({ ...LEO, profile: { ...LEO.profile, injury: 'hip' } })).status).toBe(400)
    expect((await put({ profile: LEO.profile })).status).toBe(400)
    expect(await (await h.signIn('leo@example.com', 'patient')).api.getDataset()).toBeNull()
  })

  test('an oversized request is turned away', async () => {
    const { token } = await h.signIn('leo@example.com', 'patient')
    const huge = { ...LEO, profile: { ...LEO.profile, story: 'x'.repeat(LIMITS.bodyBytes) } }
    expect((await h.request('PUT', '/v1/me/dataset', { token, body: { baseRevision: 0, data: huge } })).status).toBe(413)
  })

  test('a PT account has no record of its own, and a patient account no caseload', async () => {
    const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')
    const patient = await h.signIn('leo@example.com', 'patient')
    expect((await failure(pt.api.getDataset())).status).toBe(403)
    expect((await failure(pt.api.shares())).status).toBe(403)
    expect((await failure(patient.api.patients())).status).toBe(403)
    expect((await failure(patient.api.createInvite())).status).toBe(403)
  })
})

describe('sharing is the patient’s choice', () => {
  test('a PT sees nobody until a patient accepts their code', async () => {
    const patient = await h.signIn('leo@example.com', 'patient', 'Leo')
    const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')
    await patient.api.putDataset(0, LEO)
    const { code } = await pt.api.createInvite()
    expect(await pt.api.patients()).toEqual([])
    expect(await patient.api.previewInvite(code)).toEqual({ pt: { name: 'Dana Ruiz, PT', email: 'dana@clinic.example' } })
    expect(await pt.api.patients()).toEqual([])

    const share = await patient.api.acceptInvite(code.toLowerCase().replace(/(.{4})/, '$1-'), ['range'])
    expect(share).toMatchObject({ pt: { name: 'Dana Ruiz, PT' }, scopes: ['range'] })
    const [seen] = await pt.api.patients()
    expect(seen).toMatchObject({ id: patient.account.id, name: LEO.profile.name, scopes: ['range'] })
    expect(seen?.data?.romDays.length).toBeGreaterThan(0)
  })

  test('the PT gets only what was shared, and a change of mind applies on their next look', async () => {
    const { patient, pt, shareId } = await linked(['range'])
    const first = (await pt.patients())[0]!.data!
    expect(first.painLogs).toEqual([])
    expect(first.activityLogs).toEqual([])
    expect(first.planMarks).toBeUndefined()

    await patient.setShareScopes(shareId, ['pain', 'activity'])
    const second = (await pt.patients())[0]!.data!
    expect(second.painLogs.length).toBeGreaterThan(0)
    expect(second.activityLogs.length).toBeGreaterThan(0)
    expect(second.romDays).toEqual([])
  })

  test('the clinic site can summarise exactly what the server hands over', async () => {
    const { pt } = await linked()
    const [seen] = await pt.patients()
    const summary = patientSummary(seen!.id, seen!.data!, TODAY)
    const local = patientSummary(seen!.id, LEO, TODAY)
    expect(summary.flags.map((f) => f.title)).toEqual(local.flags.map((f) => f.title))
    expect(summary.path?.phase.n).toBe(local.path?.phase.n)
  })

  test('stopping the share cuts the PT off at once', async () => {
    const { patient, pt, patientId, shareId } = await linked()
    await patient.revokeShare(shareId)
    expect(await pt.patients()).toEqual([])
    expect(await patient.shares()).toEqual([])
    expect((await failure(pt.publishPlan(patientId, plan(1)))).status).toBe(403)
    expect((await failure(pt.plans(patientId))).status).toBe(403)
    expect((await failure(patient.revokeShare(shareId))).status).toBe(404)
  })

  test('a code works once, for seven days, and a wrong one says nothing useful', async () => {
    const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')
    const a = await h.signIn('a@example.com', 'patient')
    const b = await h.signIn('b@example.com', 'patient')
    const { code } = await pt.api.createInvite()
    await a.api.acceptInvite(code, [])
    expect((await failure(b.api.acceptInvite(code, []))).status).toBe(404)
    expect((await failure(b.api.previewInvite('ZZZZZZZZ'))).status).toBe(404)

    const late = await pt.api.createInvite()
    h.advance(LIMITS.inviteLifetime + 1000)
    const stillIn = await h.signIn('b@example.com', 'patient')
    expect((await failure(stillIn.api.acceptInvite(late.code, []))).status).toBe(404)
  })

  test('guessing codes is limited per patient', async () => {
    const guesser = await h.signIn('g@example.com', 'patient')
    for (let i = 0; i < LIMITS.inviteTriesPerPatient; i += 1) expect((await failure(guesser.api.previewInvite(`GUESS${i}AA`))).status).toBe(404)
    expect((await failure(guesser.api.previewInvite('GUESSZZZ'))).status).toBe(429)
  })

  test('a PT needs a name before inviting anyone, because the patient has to see who is asking', async () => {
    const pt = await h.signIn('new@clinic.example', 'pt')
    expect((await failure(pt.api.createInvite())).status).toBe(400)
    expect(await pt.api.rename('  Sam Okafor, DPT ')).toMatchObject({ name: 'Sam Okafor, DPT' })
    await expect(pt.api.createInvite()).resolves.toMatchObject({ code: expect.stringMatching(/^[A-Z2-9]{8}$/) })
  })

  test('one PT never sees another PT’s patient', async () => {
    const { patientId } = await linked()
    const other = await h.signIn('other@clinic.example', 'pt', 'Other PT')
    expect(await other.api.patients()).toEqual([])
    expect((await failure(other.api.plans(patientId))).status).toBe(403)
    expect((await failure(other.api.publishPlan(patientId, plan(1)))).status).toBe(403)
    expect((await h.request('GET', '/v1/patients/not-an-id/plans', { token: other.token })).status).toBe(403)
    expect((await h.request('GET', '/v1/patients/00000000-0000-4000-8000-000000000000/plans', { token: other.token })).status).toBe(403)
  })

  test('a patient who hasn’t synced yet shows up by name with no record', async () => {
    const patient = await h.signIn('new@example.com', 'patient', 'Ava')
    const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')
    await patient.api.acceptInvite((await pt.api.createInvite()).code, DEFAULT_SHARE_SCOPES)
    const [seen] = await pt.api.patients()
    expect(seen).toMatchObject({ name: 'Ava' })
    expect(seen?.data).toBeUndefined()
  })

  test('the patient can see who looked and when; refreshing doesn’t flood the list', async () => {
    const { patient, pt, patientId } = await linked()
    expect(await patient.accessLog()).toEqual([])
    await pt.patients()
    await pt.patients()
    await pt.patients()
    expect(await patient.accessLog()).toEqual([{ ptName: 'Dana Ruiz, PT', action: 'viewed', at: START.toISOString() }])
    h.advance(LIMITS.viewLogQuiet + 1000)
    await pt.patients()
    await pt.publishPlan(patientId, plan(1))
    expect((await patient.accessLog()).map((e) => e.action).sort()).toEqual(['published-plan', 'viewed', 'viewed'])
  })

  test('opening a patient’s plan history is a look too', async () => {
    const { patient, pt, patientId } = await linked()
    await pt.plans(patientId)
    await pt.plans(patientId)
    expect(await patient.accessLog()).toEqual([{ ptName: 'Dana Ruiz, PT', action: 'viewed', at: START.toISOString() }])
  })

  test('one record that won’t open doesn’t hide the rest of the caseload', async () => {
    const { pt, patientId } = await linked()
    const other = await h.signIn('maya@example.com', 'patient', 'Maya')
    await other.api.putDataset(0, sample('maya-on-track'))
    await other.api.acceptInvite((await pt.createInvite()).code, DEFAULT_SHARE_SCOPES)
    await h.db.query("UPDATE datasets SET payload = 'v1.AAAA.AAAA.AAAA' WHERE patient_id = $1", [patientId])
    const seen = await pt.patients()
    expect(seen.find((p) => p.id === patientId)).toMatchObject({ name: 'Leo', unreadable: true })
    expect(seen.find((p) => p.id === patientId)?.data).toBeUndefined()
    expect(seen.find((p) => p.id === other.account.id)?.data?.profile.name).toBe('Maya')
    expect(h.errors).toHaveLength(1)
    expect(h.errors[0]).not.toContain('Leo')
  })
})

describe('publishing a plan', () => {
  test('the PT publishes; the patient’s phone gets it; both sides resolve to the same plan', async () => {
    const { patient, pt, patientId } = await linked()
    const published = await pt.publishPlan(patientId, plan(1))
    expect(published.plan.author).toEqual({ kind: 'pt', name: 'Dana Ruiz, PT' })

    const onPhone = await patient.myPlan()
    expect(onPhone?.plan).toEqual(published.plan)
    const data = { ...LEO, ptPlan: onPhone!.plan }
    const resolved = resolvePlan({ data, guidance: 'descriptive', reco: deriveToday(data, TODAY).plan, today: TODAY, status: 'ease-off' })
    expect(resolved.source).toBe('pt')
    expect(resolved.plan?.version).toBe(1)
    // The PT chose "lighter on flare-up mornings", so an Ease off day shows the lighter dose.
    expect(resolved.today.rows.find((r) => r.name === 'Mini squats')).toMatchObject({ detail: '2 × 10', lighter: true })

    const [seen] = await pt.patients()
    expect(seen?.data?.ptPlan).toEqual(published.plan)
    expect(patientSummary(seen!.id, seen!.data!, TODAY).writtenPlan).toMatchObject({ source: 'pt', plan: { version: 1 } })
  })

  test('versions go up by one and are never replaced', async () => {
    const { pt, patientId } = await linked()
    await pt.publishPlan(patientId, plan(1))
    expect((await failure(pt.publishPlan(patientId, plan(1)))).status).toBe(409)
    expect((await failure(pt.publishPlan(patientId, plan(3)))).status).toBe(409)
    await pt.publishPlan(patientId, plan(2, { adaptation: 'as-written' }))
    const history = await pt.plans(patientId)
    expect(history.map((p) => p.plan.version)).toEqual([2, 1])
    expect(history[1]?.plan.adaptation).toBe('lighter-on-flare')
  })

  test('two publishes of the same version at once: one wins, one is told to reload', async () => {
    const { pt, patientId } = await linked()
    const results = await Promise.allSettled([pt.publishPlan(patientId, plan(1)), pt.publishPlan(patientId, plan(1))])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    const lost = results.find((r) => r.status === 'rejected') as PromiseRejectedResult
    expect((lost.reason as ApiError).status).toBe(409)
    expect(await pt.plans(patientId)).toHaveLength(1)
  })

  test('the server runs the editor’s own check, and its own shape check before that', async () => {
    const { pt, patientId } = await linked()
    const noName = await failure(pt.publishPlan(patientId, plan(1, { entries: [{ id: 'e1', source: { kind: 'custom' }, name: ' ', dose: { sets: 3, reps: 10 }, daysPerWeek: 3 }] })))
    expect(noName.status).toBe(400)
    expect(noName.message).toContain('needs a name')
    expect((await failure(pt.publishPlan(patientId, plan(1, { entries: [] })))).status).toBe(400)
    expect((await failure(pt.publishPlan(patientId, plan(1, { entries: [{ id: 'e1', source: { kind: 'custom' }, name: 'Squat', dose: { sets: 500, reps: 10 }, daysPerWeek: 3 }] })))).status).toBe(400)
    expect((await failure(pt.publishPlan(patientId, plan(1, { entries: [{ id: 'e1', source: { kind: 'custom' }, name: 'Squat', dose: { sets: 3, reps: 10 }, daysPerWeek: 9 }] })))).status).toBe(400)
    expect((await failure(pt.publishPlan(patientId, { ...plan(1), author: { kind: 'typed' } }))).status).toBe(400)
    expect((await failure(pt.publishPlan(patientId, { ...plan(1), extra: 1 } as unknown as RecoveryPlan))).status).toBe(400)
    expect(await pt.plans(patientId)).toEqual([])
  })

  test('a plan is sealed in the database too', async () => {
    const { pt, patientId } = await linked()
    await pt.publishPlan(patientId, plan(1))
    const [row] = await h.db.query<{ payload: string }>('SELECT payload FROM plans')
    expect(row?.payload).not.toContain('Wall sit')
  })

  test('the patient keeps the plan after they stop sharing', async () => {
    const { patient, pt, patientId, shareId } = await linked()
    await pt.publishPlan(patientId, plan(1))
    await patient.revokeShare(shareId)
    expect((await patient.myPlan())?.plan.version).toBe(1)
  })
})

describe('delete my data', () => {
  test('removes the account and everything under it, and the PT sees them gone', async () => {
    const { patient, pt, patientId } = await linked()
    await pt.publishPlan(patientId, plan(1))
    await pt.patients()
    await patient.deleteAccount()
    expect((await failure(patient.me())).status).toBe(401)
    expect(await pt.patients()).toEqual([])
    for (const table of ['datasets', 'shares', 'plans', 'access_log', 'sessions']) {
      const rows = await h.db.query(`SELECT 1 FROM ${table} WHERE ${table === 'sessions' ? 'account_id' : 'patient_id'} = $1`, [patientId])
      expect(rows, table).toEqual([])
    }
    expect(await h.db.query('SELECT 1 FROM accounts WHERE id = $1', [patientId])).toEqual([])
    expect(await h.db.query('SELECT 1 FROM login_codes WHERE email = $1', ['leo@example.com'])).toEqual([])
  })

  test('a PT leaving doesn’t take the patient’s plans with them', async () => {
    const { patient, pt, patientId } = await linked()
    await pt.publishPlan(patientId, plan(1))
    await pt.deleteAccount()
    expect((await patient.myPlan())?.plan.version).toBe(1)
    expect(await patient.shares()).toEqual([])
  })
})

describe('around the edges', () => {
  test('health check, unknown addresses, and no caching of anything under /v1', async () => {
    expect((await h.request('GET', '/healthz')).body).toEqual({ success: true, data: { ok: true, store: 'pglite' } })
    expect((await h.request('GET', '/v1/nope')).body).toMatchObject({ success: false, code: 'not-found' })
    const { token } = await h.signIn('a@example.com', 'patient')
    const me = await h.request('GET', '/v1/me', { token })
    expect(me.headers.get('cache-control')).toBe('no-store')
    expect(me.headers.get('x-content-type-options')).toBe('nosniff')
  })

  test('behind a proxy, the address used for limits is the one the proxy wrote, not one the caller typed', async () => {
    const proxied = await createHarness({ TRUST_PROXY: 'true' })
    try {
      const start = (spoof: string) => proxied.request('POST', '/v1/auth/start', { body: { email: `${spoof}@example.com`, role: 'patient' }, headers: { 'x-forwarded-for': `${spoof}, 203.0.113.7` } })
      let last = 200
      for (let i = 0; i <= LIMITS.signInStartsPerAddress; i += 1) last = (await start(`10.0.0.${i}`)).status
      expect(last).toBe(429)
    } finally {
      await proxied.close()
    }
  })

  test('only the clinic site’s address may call from a browser', async () => {
    const allowed = await h.request('GET', '/healthz', { headers: { origin: 'https://clinic.example' } })
    expect(allowed.headers.get('access-control-allow-origin')).toBe('https://clinic.example')
    const other = await h.request('GET', '/healthz', { headers: { origin: 'https://evil.example' } })
    expect(other.headers.get('access-control-allow-origin')).toBeNull()
  })

  test('a failure inside the server says nothing about why, and logs no data', async () => {
    const { token } = await h.signIn('a@example.com', 'patient')
    await h.db.query('ALTER TABLE datasets RENAME TO datasets_gone')
    try {
      const response = await h.request('GET', '/v1/me/dataset', { token })
      expect(response.status).toBe(500)
      expect(response.body).toEqual({ success: false, code: 'server-error', error: 'Something went wrong on RECO’s side. Try again.' })
      expect(h.errors).toHaveLength(1)
      expect(h.errors[0]).not.toContain(token)
    } finally {
      await h.db.query('ALTER TABLE datasets_gone RENAME TO datasets')
    }
  })
})
