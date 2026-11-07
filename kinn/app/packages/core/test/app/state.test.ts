import { SEED_PROFILE, seedDataset } from '../../src/sim/seed'
import { emptyDataset } from '../../src/manual/derive'
import { active, initialRoot, migrateReal, rootReducer } from '../../../../apps/mobile/src/store/state'
import type { RootState } from '../../../../apps/mobile/src/store/state'

const TODAY = '2026-11-06'
const fresh = (): RootState => initialRoot(TODAY, 'real')
const profile = { ...emptyDataset(TODAY).profile, name: 'Sam', injury: 'acl' as const, goal: 'Run again', hasPt: true }

describe('real and sample modes', () => {
  test('a real account starts empty, with no sample history', () => {
    const s = active(fresh())
    expect(s.onboarded).toBe(false)
    expect(s.data.activityLogs).toEqual([])
    expect(s.data.painLogs).toEqual([])
    expect(s.data.checkIns).toEqual([])
    expect(s.data.romDays).toEqual([])
  })

  test('finishing onboarding keeps it empty and records consent', () => {
    const s = active(rootReducer(fresh(), { type: 'completeOnboarding', profile, notifications: 'morning', consentAt: 5 }))
    expect(s.onboarded).toBe(true)
    expect(s.consentAt).toBe(5)
    expect(s.data.profile.name).toBe('Sam')
    expect(s.data.activityLogs).toEqual([])
  })

  test('logging in sample mode never touches real data, and the way back is one action', () => {
    const start = rootReducer(fresh(), { type: 'completeOnboarding', profile, notifications: 'morning', consentAt: 5 })
    const inSample = rootReducer(start, { type: 'setMode', mode: 'sample' })
    expect(active(inSample).data.profile.name).toBe(SEED_PROFILE.name)
    const logged = rootReducer(inSample, { type: 'addActivity', id: 'x', date: TODAY, activity: 'gym', intensity: 'hard' })
    expect(logged.real.data.activityLogs).toEqual([])
    const back = rootReducer(logged, { type: 'setMode', mode: 'real' })
    expect(active(back).data.activityLogs).toEqual([])
    expect(active(back).data.profile.name).toBe('Sam')
  })

  test('a starting range is labelled by who measured it', () => {
    const rom = { date: TODAY, flexionDeg: 120, extensionDeficitDeg: 2, source: 'pt' as const }
    const s = active(rootReducer(fresh(), { type: 'completeOnboarding', profile, notifications: 'off', consentAt: 5, rom }))
    expect(s.data.romDays).toEqual([rom])
  })
})

describe('migrateReal', () => {
  test('nothing stored, or something unreadable, starts empty rather than from the sample', () => {
    expect(migrateReal(null, TODAY).data.activityLogs).toEqual([])
    expect(migrateReal('nope', TODAY).onboarded).toBe(false)
    expect(migrateReal({ data: 3 }, TODAY).data.romDays).toEqual([])
  })

  test('an older build that stored the sample athlete loses all of it', () => {
    const old = { onboarded: true, seededFor: TODAY, data: seedDataset(TODAY), ptReminder: true }
    const s = migrateReal(old, TODAY)
    expect(s.data.activityLogs).toEqual([])
    expect(s.data.painLogs).toEqual([])
    expect(s.data.checkIns).toEqual([])
    expect(s.data.romDays).toEqual([])
    expect(s.data.profile.name).not.toBe(SEED_PROFILE.name)
    expect(s.onboarded).toBe(false)
  })

  test('keeps what the person logged themselves, and asks for consent again', () => {
    const seed = seedDataset(TODAY)
    const old = {
      onboarded: true,
      seededFor: TODAY,
      data: {
        ...seed,
        profile,
        activityLogs: [...seed.activityLogs, { id: 'act-mine', date: TODAY, activity: 'gym', intensity: 'hard' }],
        checkIns: [...seed.checkIns, { date: TODAY, pain: 9, swelling: 'none' }],
      },
    }
    const s = migrateReal(old, TODAY)
    expect(s.data.activityLogs.map((l) => l.id)).toEqual(['act-mine'])
    expect(s.data.checkIns).toEqual([{ date: TODAY, pain: 9, swelling: 'none' }])
    expect(s.data.romDays).toEqual([])
    expect(s.data.profile.name).toBe('Sam')
    expect(s.onboarded).toBe(false)
  })

  test('a current state passes through unchanged', () => {
    const s = active(rootReducer(fresh(), { type: 'completeOnboarding', profile, notifications: 'morning', consentAt: 5 }))
    expect(migrateReal(JSON.parse(JSON.stringify(s)), TODAY)).toEqual(s)
  })
})

describe('deleting and logging', () => {
  const ready = () => rootReducer(fresh(), { type: 'completeOnboarding', profile, notifications: 'morning', consentAt: 5 })

  test('delete clears real data and leaves the sample alone', () => {
    const logged = rootReducer(ready(), { type: 'addPress', id: 'p', date: TODAY, t: 1 })
    const gone = rootReducer(logged, { type: 'deleteMyData', today: TODAY })
    expect(gone.real.onboarded).toBe(false)
    expect(gone.real.data.painLogs).toEqual([])
    expect(gone.real.consentAt).toBeUndefined()
    expect(gone.mode).toBe('real')
    expect(gone.sample.data.activityLogs.length).toBeGreaterThan(0)
  })

  test('one tap saves with no rating, detail can follow, and undo removes it', () => {
    const tapped = rootReducer(ready(), { type: 'addPress', id: 'p', date: TODAY, t: 1 })
    expect(active(tapped).data.painLogs).toEqual([{ id: 'p', date: TODAY, t: 1, kind: 'press' }])
    const detailed = rootReducer(tapped, { type: 'updatePain', id: 'p', patch: { pain: 5, doing: 'gym' } })
    expect(active(detailed).data.painLogs[0]).toMatchObject({ id: 'p', pain: 5, doing: 'gym', t: 1 })
    expect(active(rootReducer(detailed, { type: 'removePain', id: 'p' })).data.painLogs).toEqual([])
  })

  test('choosing the same activity again clears it from the log', () => {
    const tapped = rootReducer(ready(), { type: 'addPress', id: 'p', date: TODAY, t: 1 })
    const set = rootReducer(tapped, { type: 'updatePain', id: 'p', patch: { doing: 'gym' } })
    const cleared = active(rootReducer(set, { type: 'updatePain', id: 'p', patch: { doing: undefined } }))
    expect(cleared.data.painLogs[0]).toEqual({ id: 'p', date: TODAY, t: 1, kind: 'press' })
  })

  test('a sore evening also adds a pain log, a quiet one does not', () => {
    const quiet = active(rootReducer(ready(), { type: 'setEvening', id: 'e', date: TODAY, t: 1, word: 'quiet' }))
    expect(quiet.data.painLogs).toEqual([])
    expect(quiet.data.eveningChecks).toEqual([{ date: TODAY, word: 'quiet' }])
    const sore = active(rootReducer(ready(), { type: 'setEvening', id: 'e', date: TODAY, t: 1, word: 'sore' }))
    expect(sore.data.painLogs).toEqual([{ id: 'e', date: TODAY, t: 1, kind: 'evening' }])
  })

  test('answering the evening twice replaces the answer and its pain log', () => {
    const once = rootReducer(ready(), { type: 'setEvening', id: 'e1', date: TODAY, t: 1, word: 'sore' })
    const twice = active(rootReducer(once, { type: 'setEvening', id: 'e2', date: TODAY, t: 2, word: 'quiet' }))
    expect(twice.data.eveningChecks).toEqual([{ date: TODAY, word: 'quiet' }])
    expect(twice.data.painLogs).toEqual([])
  })

  test('a measurement on the same date replaces the older one', () => {
    const a = rootReducer(ready(), { type: 'addMeasurement', rom: { date: TODAY, flexionDeg: 100, extensionDeficitDeg: 5, source: 'self' } })
    const b = active(rootReducer(a, { type: 'addMeasurement', rom: { date: TODAY, flexionDeg: 110, extensionDeficitDeg: 4, source: 'pt' } }))
    expect(b.data.romDays).toEqual([{ date: TODAY, flexionDeg: 110, extensionDeficitDeg: 4, source: 'pt' }])
  })

  test('plan marks toggle on and off', () => {
    const on = rootReducer(ready(), { type: 'togglePlanMark', date: TODAY, itemId: 'q' })
    expect(active(on).data.planMarks).toEqual([{ date: TODAY, itemId: 'q', done: true }])
    expect(active(rootReducer(on, { type: 'togglePlanMark', date: TODAY, itemId: 'q' })).data.planMarks).toEqual([])
  })

  test('exercises can be added, edited and removed', () => {
    const e = { id: 'q', name: 'Quad sets', sets: 3, reps: 10, daysPerWeek: 5 }
    const added = rootReducer(ready(), { type: 'upsertExercise', exercise: e })
    const edited = rootReducer(added, { type: 'upsertExercise', exercise: { ...e, reps: 12 } })
    expect(active(edited).data.exercises).toEqual([{ ...e, reps: 12 }])
    expect(active(rootReducer(edited, { type: 'removeExercise', id: 'q' })).data.exercises).toEqual([])
  })
})
