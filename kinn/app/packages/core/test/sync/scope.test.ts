import { sampleCaseload } from '../../src/sim/seed'
import { patientSummary } from '../../src/clinic/summary'
import { DEFAULT_SHARE_SCOPES, SHARE_SCOPES, isShareScope } from '../../src/sync/types'
import { scopedDataset, uploadableDataset } from '../../src/sync/scope'
import type { Dataset } from '../../src/manual/types'

const TODAY = '2026-11-12'
const leo = sampleCaseload(TODAY).find((p) => p.id === 'leo-flare')!.data
const withPrivate: Dataset = {
  ...leo,
  profile: { ...leo.profile, story: 'Tore it skiing.', ptEmail: 'dana@example.com' },
  painLogs: [{ id: 'x', t: 1, date: TODAY, pain: 6, note: 'gave way on the stairs', voiceUri: 'file:///voice.m4a', photoUri: 'file:///knee.jpg' }, ...leo.painLogs],
  journal: [{ id: 'j', t: 1, date: TODAY, text: 'Rough day.', source: 'typed' }],
  planMarks: [{ date: TODAY, itemId: 'mini-squat', done: true }],
  warningFeedback: [{ date: TODAY, t: 1, kind: 'wrong' }],
  bendAlerts: [{ date: TODAY, t: 1, angleDeg: 95, limitDeg: 90, loaded: false }],
}

describe('what leaves the phone', () => {
  test('voice notes, photos, the PT plan copy and warning feedback never upload', () => {
    const up = uploadableDataset(withPrivate)
    expect(JSON.stringify(up)).not.toContain('file://')
    expect(up.ptPlan).toBeUndefined()
    expect(up.warningFeedback).toBeUndefined()
    expect(up.painLogs[0]).toMatchObject({ id: 'x', pain: 6, note: 'gave way on the stairs' })
    expect(up.checkIns).toBe(withPrivate.checkIns)
  })

  test('it leaves the original record as it was', () => {
    uploadableDataset(withPrivate)
    expect(withPrivate.painLogs[0]?.voiceUri).toBe('file:///voice.m4a')
    expect(withPrivate.ptPlan).toBeDefined()
  })
})

describe('what a PT sees of a shared record', () => {
  test('with no extra scopes: the basics only', () => {
    const s = scopedDataset(withPrivate, [])
    expect(s.profile).toMatchObject({ name: withPrivate.profile.name, injury: 'acl' })
    expect(s.profile.story).toBeUndefined()
    expect(s.profile.ptEmail).toBeUndefined()
    expect(s.profile.otherKnee).toBeUndefined()
    expect(s.checkIns.length).toBe(withPrivate.checkIns.length)
    expect(s.path).toEqual(withPrivate.path)
    expect([s.painLogs, s.activityLogs, s.romDays]).toEqual([[], [], []])
    expect(s.measurements ?? s.journal ?? s.bendAlerts ?? s.eveningChecks).toBeUndefined()
  })

  test('each scope adds its own part and nothing else', () => {
    expect(scopedDataset(withPrivate, ['range']).romDays.length).toBeGreaterThan(0)
    expect(scopedDataset(withPrivate, ['range']).profile.otherKnee).toEqual(withPrivate.profile.otherKnee)
    expect(scopedDataset(withPrivate, ['activity']).activityLogs.length).toBeGreaterThan(0)
    expect(scopedDataset(withPrivate, ['tape']).bendAlerts).toHaveLength(1)
    const pain = scopedDataset(withPrivate, ['pain'])
    expect(pain.painLogs[0]).toMatchObject({ id: 'x', pain: 6 })
    expect(pain.painLogs[0]?.note).toBeUndefined()
    const notes = scopedDataset(withPrivate, ['pain', 'notes'])
    expect(notes.painLogs[0]?.note).toBe('gave way on the stairs')
    expect(notes.journal).toHaveLength(1)
    expect(notes.profile.story).toBe('Tore it skiing.')
  })

  test('which exercises were ticked off is never shared, whatever the scopes', () => {
    const all = scopedDataset(withPrivate, SHARE_SCOPES)
    expect(all.planMarks).toBeUndefined()
    expect(all.warningFeedback).toBeUndefined()
    expect(JSON.stringify(all)).not.toContain('file://')
  })

  test('a cut-down record still summarises without error, at every combination of scopes', () => {
    for (let mask = 0; mask < 2 ** SHARE_SCOPES.length; mask += 1) {
      const scopes = SHARE_SCOPES.filter((_, i) => (mask >> i) & 1)
      for (const p of sampleCaseload(TODAY)) expect(() => patientSummary(p.id, scopedDataset(p.data, scopes), TODAY)).not.toThrow()
    }
  })

  test('notes start off; unknown scope names are refused', () => {
    expect(DEFAULT_SHARE_SCOPES).not.toContain('notes')
    expect(isShareScope('range')).toBe(true)
    expect(isShareScope('everything')).toBe(false)
  })
})
