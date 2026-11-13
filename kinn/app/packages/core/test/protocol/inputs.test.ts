import { buildPlan } from '../../src/plan/build'
import { BEND_WATCH_IDLE, bendAlertsOn, bendAngle, bendOverLimit, limitFor, stepBendWatch } from '../../src/protocol/bend'
import { datasetToPathInput, nextPathRecord, pathView, protocolFor, SWELLING_TO_EFFUSION } from '../../src/protocol/inputs'
import { LIBRARY_PHASE_FOR_PROTOCOL_PHASE, libraryPhaseFor } from '../../src/protocol/phase-map'
import { emptyDataset } from '../../src/manual/derive'
import type { Dataset, MorningCheckIn, PainLog } from '../../src/manual/types'
import { startOfDay } from '../../src/time/day'

const TODAY = '2026-10-20'
const SURGERY = '2026-09-07'

const acl = (over: Partial<Dataset> = {}): Dataset => {
  const base = emptyDataset(TODAY)
  return {
    ...base,
    profile: { ...base.profile, name: 'Test', injury: 'acl', hadSurgery: true, injuryDate: SURGERY, otherKnee: { flexionDeg: 140, extensionDeficitDeg: 0 } },
    ...over,
  }
}
const checkIn = (date: string, pain: number, swelling: MorningCheckIn['swelling'] = 'none', effusion?: MorningCheckIn['effusion']): MorningCheckIn =>
  ({ date, pain, swelling, ...(effusion ? { effusion } : {}) })
const painLog = (date: string, settled?: PainLog['settled']): PainLog => ({ id: `p-${date}`, t: startOfDay(date, 20), date, pain: 4, ...(settled ? { settled } : {}) })

describe('protocolFor', () => {
  test('only ACL and meniscus surgery have a criterion-based protocol', () => {
    expect(protocolFor({ injury: 'acl', hadSurgery: true })).toBe('acl-reconstruction')
    expect(protocolFor({ injury: 'meniscus', hadSurgery: true })).toBe('meniscus-repair')
    expect(protocolFor({ injury: 'acl', hadSurgery: false })).toBeNull()
    expect(protocolFor({ injury: 'rotator-cuff', hadSurgery: true })).toBeNull()
  })

  test('everything else keeps the time-based plan', () => {
    const data = acl()
    expect(datasetToPathInput({ ...data, profile: { ...data.profile, hadSurgery: false } }, TODAY)).toBeNull()
    expect(pathView({ ...data, profile: { ...data.profile, injury: 'other' } }, TODAY)).toBeUndefined()
  })
})

describe('datasetToPathInput', () => {
  test('maps the three-word swelling answer one grade up, so "none" never passes a zero checkpoint', () => {
    expect(SWELLING_TO_EFFUSION).toEqual({ none: 'trace', some: '1+', 'a-lot': '2+' })
    const input = datasetToPathInput(acl({ checkIns: [checkIn('2026-10-19', 1, 'none')] }), TODAY)
    expect(input?.latest.effusionGrade).toEqual({ value: 'trace', date: '2026-10-19', by: 'check-in' })
  })

  test('a stroke test grade beats the mapped answer', () => {
    const input = datasetToPathInput(acl({ checkIns: [checkIn('2026-10-19', 1, 'some', 'zero')] }), TODAY)
    expect(input?.latest.effusionGrade?.value).toBe('zero')
  })

  test('a pain log that did not settle in the last week counts as a reaction', () => {
    const input = datasetToPathInput(acl({ checkIns: [checkIn('2026-10-18', 1)], painLogs: [painLog('2026-10-16', 'no')] }), TODAY)
    expect(input?.latest.painOrSwellingAfterExercise?.value).toBe(true)
  })

  test('a sore next morning counts as a reaction, an old one does not', () => {
    const recent = datasetToPathInput(acl({ checkIns: [checkIn('2026-10-17', 3)], painLogs: [painLog('2026-10-16')] }), TODAY)
    expect(recent?.latest.painOrSwellingAfterExercise?.value).toBe(true)
    const old = datasetToPathInput(acl({ checkIns: [checkIn('2026-10-02', 6), checkIn('2026-10-19', 1)], painLogs: [painLog('2026-10-01', 'no')] }), TODAY)
    expect(old?.latest.painOrSwellingAfterExercise?.value).toBe(false)
  })

  test('week-long answers expire: an old check-in or "gave way" answer no longer counts', () => {
    const input = datasetToPathInput(acl({
      checkIns: [checkIn('2026-10-01', 1, 'none', 'zero')],
      measurements: [{ metric: 'instabilityEpisodes7d', value: 0, date: '2026-10-01', by: 'check-in' }, { metric: 'slrNoLag', value: true, date: '2026-10-01', by: 'self-test' }],
    }), TODAY)
    expect(input?.latest.effusionGrade).toBeUndefined()
    expect(input?.latest.instabilityEpisodes7d).toBeUndefined()
    expect(input?.latest.slrNoLag?.value).toBe(true)
  })

  test('with no check-ins in the window the reaction checkpoint stays unknown', () => {
    expect(datasetToPathInput(acl(), TODAY)?.latest.painOrSwellingAfterExercise).toBeUndefined()
  })

  test('entered measurements are latest per metric, ignore the future, and a PT value wins the same day', () => {
    const input = datasetToPathInput(acl({
      measurements: [
        { metric: 'quadIndexPct', value: 70, date: '2026-10-10', by: 'pt' },
        { metric: 'quadIndexPct', value: 76, date: '2026-10-17', by: 'pt' },
        { metric: 'quadIndexPct', value: 90, date: '2026-10-30', by: 'pt' },
        { metric: 'slrNoLag', value: false, date: '2026-10-18', by: 'self-test' },
        { metric: 'slrNoLag', value: true, date: '2026-10-18', by: 'pt' },
      ],
    }), TODAY)
    expect(input?.latest.quadIndexPct?.value).toBe(76)
    expect(input?.latest.slrNoLag).toEqual({ value: true, date: '2026-10-18', by: 'pt' })
  })

  test('carries ROM in date order, the other knee and PT overrides', () => {
    const input = datasetToPathInput(acl({
      romDays: [
        { date: '2026-10-19', flexionDeg: 120, extensionDeficitDeg: 0, source: 'self' },
        { date: '2026-10-18', flexionDeg: 118, extensionDeficitDeg: 1, source: 'pt' },
        { date: '2026-10-21', flexionDeg: 125, extensionDeficitDeg: 0, source: 'self' },
      ],
      path: { completed: [{ phase: 1, date: '2026-09-21' }], ptPhase: 2, ptFlexionMaxDeg: null },
    }), TODAY)
    expect(input?.rom.map((r) => r.date)).toEqual(['2026-10-18', '2026-10-19'])
    expect(input?.otherKnee).toEqual({ flexionDeg: 140, extensionDeficitDeg: 0 })
    expect(input?.ptPhase).toBe(2)
    expect(input?.ptFlexionMaxDeg).toBeNull()
  })
})

describe('nextPathRecord', () => {
  const readyForPhase2 = acl({
    romDays: [{ date: TODAY, flexionDeg: 120, extensionDeficitDeg: 0, source: 'self' }],
    measurements: [
      { metric: 'quadActivationFullExtension', value: true, date: TODAY, by: 'self-test' },
      { metric: 'slrNoLag', value: true, date: TODAY, by: 'self-test' },
    ],
  })

  test('appends the phase once it is ready', () => {
    expect(nextPathRecord(readyForPhase2, TODAY)).toEqual({ completed: [{ phase: 1, date: TODAY }] })
  })

  test('advances at most once a day', () => {
    const advanced = { ...readyForPhase2, path: { completed: [{ phase: 1, date: TODAY }] } }
    expect(nextPathRecord(advanced, TODAY)).toBeNull()
  })

  test('a PT-set phase is completed once, then the checkpoints lead again', () => {
    const pinned = { ...readyForPhase2, path: { completed: [], ptPhase: 1 } }
    const next = nextPathRecord(pinned, TODAY)
    expect(next).toEqual({ completed: [{ phase: 1, date: TODAY }] })
    expect(pathView({ ...pinned, path: next! }, '2026-10-21')?.phase.n).toBe(2)
  })

  test('does nothing without a protocol or when checkpoints are open', () => {
    expect(nextPathRecord(acl(), TODAY)).toBeNull()
    expect(nextPathRecord({ ...readyForPhase2, profile: { ...readyForPhase2.profile, injury: 'other' } }, TODAY)).toBeNull()
  })
})

describe('phase map', () => {
  test('is an explicit table: 1-2 → 1, 3 → 2, 4 → 3, 5-6 → 4', () => {
    expect(LIBRARY_PHASE_FOR_PROTOCOL_PHASE).toEqual({ 1: 1, 2: 1, 3: 2, 4: 3, 5: 4, 6: 4 })
    expect(() => libraryPhaseFor(7)).toThrow()
  })

  test('the plan takes its phase from the protocol and still holds back after flare-ups', () => {
    const base = { profile: acl().profile, today: TODAY, status: 'keep-going' as const, marks: [] }
    expect(buildPlan({ ...base, flares: [], protocolPhase: 4 })).toMatchObject({ phase: 3, phaseFrom: 'checkpoints', heldBack: false })
    const flares = [{ date: '2026-10-15', reason: 'swelling' as const }, { date: '2026-10-18', reason: 'morning-pain' as const }]
    expect(buildPlan({ ...base, flares, protocolPhase: 4 })).toMatchObject({ phase: 2, heldBack: true })
    expect(buildPlan({ ...base, flares: [] }).phaseFrom).toBe('time')
  })
})

describe('bend limits', () => {
  const limits = { flexionMaxDeg: 90, loadedFlexionMaxDeg: 60, setBy: 'protocol' as const }
  const t = startOfDay(TODAY, 10)

  test('the loaded limit applies only while the leg takes weight', () => {
    expect(limitFor({ loaded: false }, limits)).toBe(90)
    expect(limitFor({ loaded: true }, limits)).toBe(60)
    expect(limitFor({ loaded: true }, { flexionMaxDeg: null, loadedFlexionMaxDeg: null, setBy: 'none' })).toBeNull()
  })

  test('a bend past the limit is an alert, one at the limit is not', () => {
    expect(bendOverLimit({ t, angleDeg: 90, loaded: false }, limits)).toBeNull()
    expect(bendOverLimit({ t, angleDeg: 97.4, loaded: false }, limits)).toEqual({ date: TODAY, t, angleDeg: 97, limitDeg: 90, loaded: false })
    expect(bendOverLimit({ t, angleDeg: 65, loaded: true }, limits)?.limitDeg).toBe(60)
  })

  test('counts alerts per day', () => {
    const a = bendOverLimit({ t, angleDeg: 95, loaded: false }, limits)!
    expect(bendAlertsOn([a, a, { ...a, date: '2026-10-19' }], TODAY)).toBe(2)
  })
})

describe('live bend from the tape', () => {
  const tape = { restRaw: 300, maxRaw: 2300 }
  const cal = { maxDeg: 80, date: TODAY }
  const limits = { flexionMaxDeg: 90, loadedFlexionMaxDeg: null, setBy: 'protocol' as const }

  test('maps raw linearly from straight to the max point, and extends past it', () => {
    expect(bendAngle(300, tape, cal)).toBe(0)
    expect(bendAngle(1300, tape, cal)).toBe(40)
    expect(bendAngle(2800, tape, cal)).toBe(100)
    expect(bendAngle(100, tape, cal)).toBe(0)
  })

  test('gives no angle without a usable calibration', () => {
    expect(bendAngle(1000, { restRaw: 300, maxRaw: 350 }, cal)).toBeNull()
    expect(bendAngle(1000, tape, { maxDeg: 0, date: TODAY })).toBeNull()
  })

  test('one alert per excursion, only after it stays over the limit, and again after coming back under', () => {
    const run = (angles: readonly [number, number][]) => {
      let state = BEND_WATCH_IDLE
      const alerts: number[] = []
      for (const [uptimeMs, angleDeg] of angles) {
        const out = stepBendWatch(state, { t: startOfDay(TODAY, 10) + uptimeMs, uptimeMs, angleDeg, loaded: false }, limits)
        state = out.state
        if (out.alert) alerts.push(uptimeMs)
      }
      return alerts
    }
    // A 100 ms twitch over the limit does not count.
    expect(run([[0, 85], [50, 95], [150, 95], [200, 80]])).toEqual([])
    // Held over: one alert at 300 ms, none while it stays over or hovers just under.
    expect(run([[0, 95], [200, 96], [300, 97], [600, 99], [700, 89], [800, 95], [1200, 96]])).toEqual([300])
    // Back well under the limit re-arms it.
    expect(run([[0, 95], [300, 95], [400, 80], [500, 95], [800, 95]])).toEqual([300, 800])
  })

  test('nothing to watch without a limit', () => {
    const out = stepBendWatch({ overSinceMs: 0, fired: false }, { t: 0, uptimeMs: 999, angleDeg: 150, loaded: false }, { flexionMaxDeg: null, loadedFlexionMaxDeg: null, setBy: 'none' })
    expect(out).toEqual({ state: BEND_WATCH_IDLE, alert: null })
  })
})
