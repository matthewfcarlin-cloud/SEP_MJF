import { DEFAULT_SHARE_SCOPES, planChanged, sampleCaseload, syncOnce, uploadFingerprint } from '@reco/core'
import type { Dataset, RecoveryPlan } from '@reco/core'

import { createHarness } from './harness'
import type { Harness } from './harness'

let h: Harness
beforeAll(async () => { h = await createHarness() })
afterAll(async () => { await h.close() })
beforeEach(async () => { await h.reset() })

const TODAY = '2026-11-15'
const maya: Dataset = sampleCaseload(TODAY).find((p) => p.id === 'maya-on-track')!.data
const plan: RecoveryPlan = {
  id: 'p', version: 1, author: { kind: 'pt', name: '' }, adaptation: 'as-written', publishedOn: TODAY,
  entries: [{ id: 'e1', source: { kind: 'library', exerciseId: 'heel-prop' }, name: 'Heel prop', dose: { minutes: 5 }, daysPerWeek: 7 }],
}

describe('one sync pass from the phone', () => {
  test('the first pass uploads; an unchanged record is not sent again; a change is', async () => {
    const { api } = await h.signIn('maya@example.com', 'patient', 'Maya')
    const first = await syncOnce(api, maya, 0)
    expect(first).toEqual({ revision: 1, plan: undefined, uploaded: true })
    const quiet = await syncOnce(api, maya, first.revision, uploadFingerprint(maya))
    expect(quiet).toEqual({ revision: 1, plan: undefined, uploaded: false })
    const changed: Dataset = { ...maya, checkIns: [...maya.checkIns, { date: '2026-11-16', pain: 1, swelling: 'none' }] }
    expect(await syncOnce(api, changed, 1, uploadFingerprint(maya))).toMatchObject({ revision: 2, uploaded: true })
  })

  test('what the phone keeps to itself never reaches the server', async () => {
    const { api } = await h.signIn('maya@example.com', 'patient', 'Maya')
    const withFiles: Dataset = { ...maya, painLogs: [{ id: 'x', t: 1, date: TODAY, pain: 4, voiceUri: 'file:///v.m4a', photoUri: 'file:///p.jpg' }], warningFeedback: [{ date: TODAY, t: 1, kind: 'wrong' }] }
    await syncOnce(api, withFiles, 0)
    const stored = await api.getDataset()
    expect(JSON.stringify(stored)).not.toContain('file://')
    expect(stored?.data.warningFeedback).toBeUndefined()
    expect(stored?.data.ptPlan).toBeUndefined()
  })

  test('a phone that lost track of the revision (a reinstall) catches up and saves', async () => {
    const { api } = await h.signIn('maya@example.com', 'patient', 'Maya')
    await syncOnce(api, maya, 0)
    await syncOnce(api, { ...maya, romDays: [] }, 1)
    const reinstalled = await syncOnce(api, maya, 0)
    expect(reinstalled.revision).toBe(3)
    expect((await api.getDataset())?.data.romDays.length).toBe(maya.romDays.length)
  })

  test('the PT’s plan comes down on the next pass, and state changes only when the version does', async () => {
    const patient = await h.signIn('maya@example.com', 'patient', 'Maya')
    const pt = await h.signIn('dana@clinic.example', 'pt', 'Dana Ruiz, PT')
    const first = await syncOnce(patient.api, maya, 0)
    await patient.api.acceptInvite((await pt.api.createInvite()).code, DEFAULT_SHARE_SCOPES)
    await pt.api.publishPlan(patient.account.id, plan)

    const second = await syncOnce(patient.api, maya, first.revision, uploadFingerprint(maya))
    expect(second.plan).toMatchObject({ version: 1, author: { name: 'Dana Ruiz, PT' } })
    expect(planChanged(undefined, second.plan)).toBe(true)
    expect(planChanged(second.plan, second.plan)).toBe(false)
    // The plan now sits in the phone's record; it is not echoed back up, so nothing is re-sent.
    const third = await syncOnce(patient.api, { ...maya, ptPlan: second.plan! }, second.revision, uploadFingerprint(maya))
    expect(third.uploaded).toBe(false)
  })

  test('a failure that isn’t a conflict is passed on, not swallowed', async () => {
    const { api } = await h.signIn('maya@example.com', 'patient', 'Maya')
    await api.signOut()
    await expect(syncOnce(api, maya, 0)).rejects.toMatchObject({ status: 401 })
  })
})
