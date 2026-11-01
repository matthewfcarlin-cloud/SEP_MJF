import { buildPlan, phaseForWeeks } from '../../src/plan/build'
import { LIBRARY } from '../../src/plan/library'
import { containsBannedWord } from '../../src/copy/banned'
import type { Profile } from '../../src/manual/types'

const TODAY = '2026-11-04' // a Wednesday
const profile = (over: Partial<Profile> = {}): Profile => ({
  name: 'Maya', joint: 'knee', injury: 'acl', injuryDate: '2026-09-02', hadSurgery: true, sport: 'Basketball', hasPt: true, goal: 'Back for spring season', ...over,
})

describe('phaseForWeeks', () => {
  test('moves through four phases at the thresholds', () => {
    expect([0, 5, 6, 11, 12, 30].map((w) => phaseForWeeks(w, [6, 12, 24]))).toEqual([1, 1, 2, 2, 3, 4])
  })
})

describe('buildPlan', () => {
  test('week 9 after ACL surgery is phase 2 with strength on Wednesday', () => {
    const p = buildPlan({ profile: profile(), today: TODAY, status: 'keep-going', flares: [], marks: [] })
    expect(p.phase).toBe(2)
    expect(p.phaseName).toBe('Build strength')
    expect(p.today.items.map((i) => i.exercise.kind)).toEqual(expect.arrayContaining(['strength']))
    expect(p.today.items.every((i) => i.dose === i.exercise.dose)).toBe(true)
    expect(p.week).toHaveLength(7)
    expect(p.source).toBe('with-pt')
  })

  test('Steady uses the lighter dose and drops sport; Ease off becomes a recovery day', () => {
    const steady = buildPlan({ profile: profile({ injuryDate: '2026-03-01' }), today: '2026-11-06', status: 'steady', flares: [], marks: [] })
    expect(steady.today.items.some((i) => i.exercise.kind === 'sport')).toBe(false)
    expect(steady.today.items.every((i) => i.dose === i.exercise.lightDose)).toBe(true)
    const off = buildPlan({ profile: profile(), today: TODAY, status: 'ease-off', flares: [], marks: [] })
    expect(off.today.items.map((i) => i.exercise.id)).toEqual(['heel-slide', 'walk-easy'])
    expect(off.today.why).toContain('recovery day')
  })

  test('two flare-ups in ten days hold the phase back by one', () => {
    const flares = [{ date: '2026-11-01', reason: 'morning-pain' as const }, { date: '2026-11-03', reason: 'swelling' as const }]
    const p = buildPlan({ profile: profile(), today: TODAY, status: 'steady', flares, marks: [] })
    expect(p.phase).toBe(1)
    expect(p.heldBack).toBe(true)
  })

  test('marks count toward the week and the no-PT path is labelled protocol', () => {
    const p = buildPlan({ profile: profile({ hasPt: false }), today: TODAY, status: 'keep-going', flares: [], marks: [{ date: TODAY, itemId: 'mini-squat', done: true }] })
    expect(p.source).toBe('protocol')
    expect(p.today.items.find((i) => i.id === 'mini-squat')?.done).toBe(true)
    expect(p.doneThisWeek).toBe(1)
  })

  test('shoulder and elbow plans use their own exercises and an honest return range', () => {
    const s = buildPlan({ profile: profile({ joint: 'shoulder', injury: 'rotator-cuff' }), today: TODAY, status: 'keep-going', flares: [], marks: [] })
    expect(s.week.flatMap((d) => d.items).every((i) => LIBRARY.shoulder[s.phase].some((e) => e.id === i.id))).toBe(true)
    expect(s.typicalReturn).toEqual({ lowWeeks: 24, highWeeks: 40, weeksIn: 9 })
  })

  test('no exercise text uses banned words', () => {
    for (const joint of Object.values(LIBRARY)) for (const phase of Object.values(joint)) for (const e of phase) {
      for (const s of [e.name, e.how, e.dose, e.lightDose]) expect(containsBannedWord(s)).toBe(false)
    }
  })
})
