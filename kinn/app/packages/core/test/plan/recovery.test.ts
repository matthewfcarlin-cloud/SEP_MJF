import { buildPlan } from '../../src/plan/build'
import { catalogFor, entryFromLibrary, WORKS_TOWARD } from '../../src/plan/catalog'
import { LIBRARY } from '../../src/plan/library'
import { doseText, parseDose, planDay, planFromTyped, validatePlan } from '../../src/plan/recovery'
import type { RecoveryPlan } from '../../src/plan/recovery'
import { resolvePlan } from '../../src/plan/resolve'
import { emptyDataset } from '../../src/manual/derive'
import type { Dataset } from '../../src/manual/types'
import { PROTOCOLS } from '../../src/protocol/protocols'

const TODAY = '2026-11-04' // a Wednesday
const MONDAY = '2026-11-02'

const ptPlan = (over: Partial<RecoveryPlan> = {}): RecoveryPlan => ({
  id: 'plan-1',
  version: 2,
  author: { kind: 'pt', name: 'Dana Ruiz, PT' },
  adaptation: 'as-written',
  publishedOn: '2026-11-01',
  entries: [
    { id: 'e1', source: { kind: 'library', exerciseId: 'slr' }, name: 'Straight-leg raise', dose: { sets: 3, reps: 12 }, lightDose: { sets: 2, reps: 8 }, daysPerWeek: 7 },
    { id: 'e2', source: { kind: 'custom' }, name: 'Wall sit', dose: { sets: 3, seconds: 30 }, daysPerWeek: 3 },
  ],
  ...over,
})

describe('doses', () => {
  test('read the library’s dose strings and write them back the same way', () => {
    expect(parseDose('3 × 12')).toEqual({ sets: 3, reps: 12 })
    expect(parseDose('3 × 10 each')).toEqual({ sets: 3, reps: 10, perSide: true })
    expect(parseDose('3 × 30 s')).toEqual({ sets: 3, seconds: 30 })
    expect(parseDose('3 × 10, 5 s hold')).toEqual({ sets: 3, reps: 10, seconds: 5 })
    expect(parseDose('20 min, 6 × 30 s harder')).toEqual({ minutes: 20, note: '6 × 30 s harder' })
    expect(parseDose('4 × 30 m')).toEqual({ note: '4 × 30 m' })
    expect(parseDose('As your PT sets')).toEqual({ note: 'As your PT sets' })
    for (const s of ['3 × 12', '3 × 10 each', '3 × 30 s', '3 × 10, 5 s hold', '15 min']) expect(doseText(parseDose(s))).toBe(s)
  })

  test('every library dose reads into something showable', () => {
    for (const joint of Object.values(LIBRARY)) for (const phase of Object.values(joint)) for (const e of phase) {
      expect(doseText(parseDose(e.dose))).not.toBe('')
      expect(doseText(parseDose(e.lightDose))).not.toBe('')
    }
  })
})

describe('validatePlan', () => {
  test('accepts a sound plan', () => {
    expect(validatePlan(ptPlan())).toEqual([])
  })

  test('names every problem a backend should refuse', () => {
    const bad = ptPlan({
      version: 0,
      author: { kind: 'pt', name: ' ' },
      entries: [
        { id: 'x', source: { kind: 'custom' }, name: '', dose: {}, daysPerWeek: 0 },
        { id: 'x', source: { kind: 'custom' }, name: 'Squat', dose: { sets: 99, reps: 10 }, daysPerWeek: 8 },
      ],
    })
    expect(validatePlan(bad)).toEqual([
      'The version must be a whole number from 1',
      'Add your name, as the patient will see it',
      'Exercise 1 needs a name',
      'Exercise 1: days a week must be 1 to 7',
      'Exercise 1 needs a dose',
      'Exercise 2 repeats another exercise’s id',
      'Exercise 2: days a week must be 1 to 7',
      'Exercise 2: a dose number is out of range (sets up to 20, reps up to 200, hold up to 600 s, minutes up to 240)',
    ])
  })
})

describe('planDay', () => {
  test('spreads entries across the week the way the typed plan does', () => {
    const monday = planDay(ptPlan(), MONDAY, 'planned', [])
    expect(monday.entries.map((e) => e.entry.id)).toEqual(['e1', 'e2'])
    const tuesday = planDay(ptPlan(), '2026-11-03', 'planned', [])
    expect(tuesday.entries.map((e) => e.entry.id)).toEqual(['e1'])
  })

  test('as written: a flare-up morning changes nothing', () => {
    const d = planDay(ptPlan(), MONDAY, 'ease-off', [])
    expect(d.entries.map((e) => doseText(e.dose))).toEqual(['3 × 12', '3 × 30 s'])
    expect(d.entries.every((e) => !e.lighter)).toBe(true)
  })

  test('lighter on flare-ups: Ease off swaps in the lighter dose where the PT gave one, only then', () => {
    const plan = ptPlan({ adaptation: 'lighter-on-flare' })
    const off = planDay(plan, MONDAY, 'ease-off', [])
    expect(off.entries.map((e) => [doseText(e.dose), e.lighter])).toEqual([['2 × 8', true], ['3 × 30 s', false]])
    const steady = planDay(plan, MONDAY, 'steady', [])
    expect(steady.entries.map((e) => doseText(e.dose))).toEqual(['3 × 12', '3 × 30 s'])
  })

  test('marks count as done on their day', () => {
    const d = planDay(ptPlan(), MONDAY, 'planned', [{ date: MONDAY, itemId: 'e1', done: true }])
    expect(d.entries.map((e) => e.done)).toEqual([true, false])
    expect(d.allDone).toBe(false)
  })

  test('a typed plan reads as a plan record', () => {
    const p = planFromTyped([{ id: 't', name: 'Quad sets', sets: 3, reps: 10, daysPerWeek: 5, note: 'slow' }], TODAY)
    expect(p).toMatchObject({ author: { kind: 'typed' }, adaptation: 'as-written' })
    expect(doseText(p.entries[0]!.dose)).toBe('3 × 10, slow')
  })
})

describe('resolvePlan', () => {
  const base = emptyDataset(TODAY)
  const data = (over: Partial<Dataset> = {}, hasPt = false): Dataset => ({
    ...base,
    profile: { ...base.profile, name: 'Maya', joint: 'knee', injury: 'acl', injuryDate: '2026-09-02', hadSurgery: true, hasPt },
    ...over,
  })
  const resolve = (d: Dataset, guidance: 'descriptive' | 'pt-led' | 'guided') =>
    resolvePlan({ data: d, guidance, reco: buildPlan({ profile: d.profile, today: TODAY, status: 'keep-going', flares: [], marks: [] }), today: TODAY, status: 'keep-going' })

  test('the PT’s plan wins at every guidance level', () => {
    for (const g of ['descriptive', 'pt-led', 'guided'] as const) {
      const r = resolve(data({ ptPlan: ptPlan(), exercises: [{ id: 't', name: 'Other', sets: 1, reps: 1, daysPerWeek: 7 }] }), g)
      expect(r.source).toBe('pt')
      expect(r.today.rows.map((x) => x.name)).toEqual(['Straight-leg raise', 'Wall sit'])
    }
  })

  test('then what the patient typed in from their PT, including an empty start', () => {
    expect(resolve(data({ exercises: [{ id: 't', name: 'Quad sets', sets: 3, reps: 10, daysPerWeek: 7 }] }), 'descriptive')).toMatchObject({ source: 'typed', empty: false })
    expect(resolve(data({}, true), 'guided')).toMatchObject({ source: 'typed', empty: true })
  })

  test('RECO’s own plan only at Guided; below it, no plan', () => {
    const guided = resolve(data(), 'guided')
    expect(guided.source).toBe('reco')
    expect(guided.week).toHaveLength(7)
    for (const g of ['descriptive', 'pt-led'] as const) {
      const r = resolve(data(), g)
      expect(r).toMatchObject({ source: 'none', empty: true })
      expect(r.week.every((d) => d.rows.length === 0)).toBe(true)
    }
  })
})

describe('catalog', () => {
  const knee = catalogFor('knee')
  const kneeMetrics = new Set(Object.values(PROTOCOLS).flatMap((p) => p.phases.flatMap((ph) => ph.exitCriteria.map((c) => c.metric))))

  test('lists each knee exercise once, in phase order', () => {
    const ids = knee.map((c) => c.exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(knee.map((c) => c.phase)).toEqual([...knee.map((c) => c.phase)].sort())
  })

  test('works-toward only names checkpoints the protocols really have', () => {
    for (const metrics of Object.values(WORKS_TOWARD)) for (const m of metrics) expect(kneeMetrics.has(m)).toBe(true)
    expect(knee.find((c) => c.exercise.id === 'slr')?.worksToward).toEqual(['slrNoLag'])
  })

  test('a picked exercise becomes an editable entry with the library’s doses', () => {
    const squat = knee.find((c) => c.exercise.id === 'mini-squat')!.exercise
    const e = entryFromLibrary(squat, 'n1')
    expect(e).toMatchObject({ id: 'n1', source: { kind: 'library', exerciseId: 'mini-squat' }, dose: { sets: 3, reps: 12 }, lightDose: { sets: 2, reps: 10 }, daysPerWeek: 3 })
    expect(validatePlan(ptPlan({ entries: [e] }))).toEqual([])
  })
})
