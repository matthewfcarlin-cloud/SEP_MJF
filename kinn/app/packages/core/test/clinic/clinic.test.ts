import { findBannedWords } from '../../src/copy/banned'
import { caseloadOrder, patientSummary } from '../../src/clinic/summary'
import { FLAG_RULES, flagsFor } from '../../src/clinic/flags'
import { ringHours, WEEK_HOURS, weekRing } from '../../src/clinic/ring'
import { emptyDataset } from '../../src/manual/derive'
import type { Dataset, MorningCheckIn, PainLog } from '../../src/manual/types'
import { pathView } from '../../src/protocol/inputs'
import { sampleCaseload } from '../../src/sim/seed'
import { addDays, startOfDay } from '../../src/time/day'

const TODAY = '2026-11-12'
const YESTERDAY = addDays(TODAY, -1)

const patient = (over: Partial<Dataset> = {}): Dataset => {
  const base = emptyDataset(TODAY)
  return { ...base, profile: { ...base.profile, name: 'Test', injury: 'acl', hadSurgery: true, injuryDate: addDays(TODAY, -7) }, ...over }
}
const checkIn = (date: string, pain: number, swelling: MorningCheckIn['swelling'] = 'none'): MorningCheckIn => ({ date, pain, swelling })
const pain = (date: string, extra: Partial<PainLog> = {}): PainLog => ({ id: `p-${date}-${extra.pain ?? 0}`, t: startOfDay(date, 19), date, ...extra })
const flags = (data: Dataset) => flagsFor(data, TODAY, pathView(data, TODAY))

describe('contact-soon flags', () => {
  test('pain at 8 or above from the pain button or the check-in, today or yesterday', () => {
    const f = flags(patient({ painLogs: [pain(YESTERDAY, { pain: 8, doing: 'stairs' })], checkIns: [checkIn(TODAY, 9)] }))
    expect(f.map((x) => [x.tier, x.kind, x.source])).toEqual([
      ['contact-soon', 'pain-spike', 'check-in'],
      ['contact-soon', 'pain-spike', 'pain-log'],
      // Morning pain that high is also a flare-up; it sorts below the contact-soon flags.
      ['worth-a-look', 'flare-up', 'check-in'],
    ])
    expect(f[1]?.title).toBe('Pain 8 logged')
  })

  test('red-flag words in a note, quoted as the patient wrote them', () => {
    const [f] = flags(patient({ painLogs: [pain(TODAY, { pain: 6, note: 'it buckled going downstairs' })] }))
    expect(f).toMatchObject({ tier: 'contact-soon', kind: 'red-flag-words', date: TODAY })
    expect(f?.detail).toContain('it buckled going downstairs')
  })

  test('a giving-way answer at check-in, but not twice when the note already says so', () => {
    const gaveWay = { metric: 'instabilityEpisodes7d' as const, value: 1, date: TODAY, by: 'check-in' as const }
    expect(flags(patient({ measurements: [gaveWay] })).map((x) => x.kind)).toEqual(['gave-way'])
    const both = flags(patient({ measurements: [gaveWay], painLogs: [pain(TODAY, { note: 'knee gave way' })] }))
    expect(both.map((x) => x.kind)).toEqual(['red-flag-words'])
  })

  test('a note the night before and the check-in answer next morning are one event', () => {
    const gaveWay = { metric: 'instabilityEpisodes7d' as const, value: 1, date: TODAY, by: 'check-in' as const }
    const f = flags(patient({ measurements: [gaveWay], painLogs: [pain(YESTERDAY, { note: 'knee buckled on the stairs' })] }))
    expect(f.map((x) => x.kind)).toEqual(['red-flag-words'])
  })

  test('another red-flag word does not hide a giving-way answer', () => {
    const gaveWay = { metric: 'instabilityEpisodes7d' as const, value: 1, date: TODAY, by: 'check-in' as const }
    const f = flags(patient({ measurements: [gaveWay], painLogs: [pain(TODAY, { note: 'foot feels numb' })] }))
    expect(f.map((x) => x.kind).sort()).toEqual(['gave-way', 'red-flag-words'])
  })

  test('the rolling giving-way count is flagged once, from the latest answer', () => {
    const answer = (date: string, value: number) => ({ metric: 'instabilityEpisodes7d' as const, value, date, by: 'check-in' as const })
    expect(flags(patient({ measurements: [answer(YESTERDAY, 1), answer(TODAY, 1)] })).map((x) => [x.kind, x.date])).toEqual([['gave-way', TODAY]])
    expect(flags(patient({ measurements: [answer(YESTERDAY, 1), answer(TODAY, 0)] }))).toEqual([])
  })

  test('two pain logs the same day get two flags with different ids', () => {
    const f = flags(patient({ painLogs: [pain(TODAY, { pain: 8 }), { ...pain(TODAY, { pain: 8 }), id: 'second' }] }))
    expect(f).toHaveLength(2)
    expect(new Set(f.map((x) => x.id)).size).toBe(2)
  })

  test('anything older than two days is no longer a contact-soon flag', () => {
    const old = addDays(TODAY, -FLAG_RULES.contactWindowDays)
    expect(flags(patient({ painLogs: [pain(old, { pain: 9 })], checkIns: [checkIn(old, 9)] })).filter((x) => x.tier === 'contact-soon')).toEqual([])
  })
})

describe('worth-a-look flags', () => {
  test('a run of flare-ups is one flag, described by the latest', () => {
    const f = flags(patient({ checkIns: [checkIn(addDays(TODAY, -2), 5), checkIn(YESTERDAY, 2, 'a-lot')] }))
    expect(f).toHaveLength(1)
    expect(f[0]).toMatchObject({ tier: 'worth-a-look', kind: 'flare-up', title: '2 flare-ups in 3 days', date: YESTERDAY })
    expect(f[0]?.detail).toContain('Swelling')
  })

  test('pain that did not settle shows as a flare-up the next morning', () => {
    const [f] = flags(patient({ checkIns: [checkIn(TODAY, 1)], painLogs: [pain(YESTERDAY, { pain: 4, settled: 'no' })] }))
    expect(f).toMatchObject({ kind: 'flare-up', date: TODAY, source: 'pain-log' })
  })

  test('bends past the limit are counted over the last week', () => {
    const alert = { date: YESTERDAY, t: 1, angleDeg: 97, limitDeg: 90, loaded: false }
    const old = { ...alert, date: addDays(TODAY, -10) }
    const [f] = flags(patient({ bendAlerts: [alert, { ...alert, date: TODAY }, old] }))
    expect(f).toMatchObject({ kind: 'bend-limit', title: '2 bends past the limit', date: TODAY, source: 'tape' })
    expect(f?.detail).toContain('90°')
  })

  test('the bend flag names the limit at the time, not one raised since', () => {
    const alert = { date: YESTERDAY, t: 1, angleDeg: 97, limitDeg: 90, loaded: false }
    const raised = patient({ bendAlerts: [alert], path: { completed: [], ptFlexionMaxDeg: 120 } })
    expect(flags(raised)[0]?.detail).toContain('90°')
  })
})

describe('the sample caseload', () => {
  const list = caseloadOrder(sampleCaseload(TODAY).map((p) => patientSummary(p.id, p.data, TODAY)))
  const byName = (name: string) => list.find((p) => p.name === name)!

  test('is sorted with the most urgent first, then by name', () => {
    expect(list.map((p) => [p.name, p.topTier ?? 'none'])).toEqual([
      ['Ava', 'contact-soon'],
      ['Leo', 'worth-a-look'],
      ['Priya', 'worth-a-look'],
      ['Sam', 'note'],
      ['Jordan', 'none'],
      ['Maya', 'none'],
    ])
  })

  test('each patient carries progress, next steps and a weekly headline from the shared logic', () => {
    const leo = byName('Leo')
    expect(leo).toMatchObject({ surgeryLabel: 'ACL reconstruction', plan: { heldBack: true } })
    expect(leo.path?.phase.n).toBe(3)
    expect(leo.nextSteps.open.map((c) => c.criterion.id)).toEqual(['acl3-noreact'])
    expect(leo.week.headline).toMatch(/flare-up mornings/)
    expect(byName('Ava').nextSteps.forClinic.map((c) => c.criterion.measuredBy)).toEqual(['pt', 'pt', 'pt'])
    expect(byName('Maya').nextSteps.phaseLine).toContain('opens at week 6')
    expect(byName('Sam').nextSteps.phaseLine).not.toContain('not before')
  })

  test('without a checkpoint protocol, the phase line says so', () => {
    const data = patient({ profile: { ...patient().profile, injury: 'rotator-cuff' } })
    const s = patientSummary('x', data, TODAY)
    expect(s.path).toBeUndefined()
    expect(s.surgeryLabel).toBe('Rotator cuff surgery')
    expect(s.nextSteps.phaseLine).toContain('No checkpoint protocol')
  })

  test('the gave-way sample agrees with itself: the note and the check-in answer are both today', () => {
    const ava = byName('Ava')
    expect(ava.flags.map((f) => f.kind)).toEqual(['red-flag-words'])
    expect(ava.path?.criteria.find((c) => c.criterion.id === 'acl4-inst')?.current).toBe(1)
  })

  test('every flag id is unique per patient', () => {
    for (const p of list) expect(new Set(p.flags.map((f) => f.id)).size).toBe(p.flags.length)
  })

  test('flag text never judges the patient or makes a clinical call', () => {
    // "patient" is fine for a PT; the rest of the list applies here too.
    const offenders = list.flatMap((p) => p.flags.flatMap((f) => [f.title, f.detail, p.nextSteps.phaseLine]))
      .filter((t) => findBannedWords(t).some((w) => w !== 'patient'))
    expect(offenders).toEqual([])
  })
})

describe('week ring', () => {
  const ring = (data: Dataset) => weekRing(data, TODAY)

  test('covers the seven days ending today, oldest first', () => {
    const r = ring(patient())
    expect(r.days.map((d) => d.date)).toEqual([addDays(TODAY, -6), addDays(TODAY, -5), addDays(TODAY, -4), addDays(TODAY, -3), addDays(TODAY, -2), YESTERDAY, TODAY])
    expect(r).toMatchObject({ visits: 0, hoursInClinic: 0, hoursBetween: WEEK_HOURS, checkIns: 0, painLogs: 0, bendAlerts: 0 })
  })

  test('puts pain logs and bend alerts at their hour, and counts clinic visits as an hour each', () => {
    const data = patient({
      activityLogs: [
        { id: 'a', date: YESTERDAY, activity: 'pt', intensity: 'moderate' },
        { id: 'b', date: YESTERDAY, activity: 'gym', intensity: 'light' },
        { id: 'c', date: TODAY, activity: 'pt', intensity: 'light' },
      ],
      painLogs: [pain(YESTERDAY, { pain: 6, settled: 'no' }), { ...pain(TODAY, { note: 'knee gave way' }), t: startOfDay(TODAY, 8) + 30 * 60_000 }],
      bendAlerts: [{ date: YESTERDAY, t: startOfDay(YESTERDAY, 18), angleDeg: 97, limitDeg: 90, loaded: false }],
      checkIns: [checkIn(TODAY, 2)],
    })
    const r = ring(data)
    const y = r.days.at(-2)!
    const t = r.days.at(-1)!
    expect(y).toMatchObject({ ptVisit: true, activities: ['gym'], bends: [{ hour: 18, angleDeg: 97, limitDeg: 90 }] })
    expect(y.pain[0]).toMatchObject({ hour: 19, pain: 6, didNotSettle: true, redFlag: false })
    expect(t.pain[0]).toMatchObject({ hour: 8.5, redFlag: true })
    expect(t.checkInPain).toBe(2)
    expect(r).toMatchObject({ visits: 2, hoursInClinic: 2, hoursBetween: 166, checkIns: 1, painLogs: 2, bendAlerts: 1 })
  })

  test('the centre counts only hours that have passed, minus the clinic hours, so it matches the arc', () => {
    const r = ring(patient({ activityLogs: [{ id: 'a', date: YESTERDAY, activity: 'pt', intensity: 'moderate' }] }))
    expect(ringHours(r, 10.5)).toEqual({ elapsed: 154, inClinic: 1, unseen: 153 })
    expect(ringHours(r, 30).elapsed).toBe(WEEK_HOURS)
    expect(ringHours(ring(patient()), 0)).toEqual({ elapsed: 144, inClinic: 0, unseen: 144 })
  })

  test('marks each morning the way the weekly report does', () => {
    const r = ring(patient({ checkIns: [checkIn(YESTERDAY, 5), checkIn(TODAY, 1)] }))
    expect(r.days.at(-2)?.morning).toBe('flare')
    expect(r.days.at(-1)?.morning).toBe('clear')
    expect(r.days[0]?.morning).toBe('none')
  })
})
