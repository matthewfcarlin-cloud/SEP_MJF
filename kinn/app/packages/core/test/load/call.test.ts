import { evaluateCall, projectEndOfDay } from '../../src/load/call'
import type { CallInput } from '../../src/load/call'

const band = { lower: 35, upper: 55, source: 'protocol' as const }

const base: CallInput = {
  scoreSoFar: 40,
  projected: 45,
  band,
  excursionsToday: 0,
  maxPainToday: undefined,
  lastNightSwelling: undefined,
  flareUpInLast24h: false,
  wearCoverage: 1,
  elapsedActiveMinutes: 600,
}

describe('evaluateCall', () => {
  test('below the band projects to room to push', () => {
    expect(evaluateCall({ ...base, projected: 20 })).toBe('room-to-push')
  })

  test('inside the band is on target, inclusive of both edges', () => {
    expect(evaluateCall({ ...base, projected: 35 })).toBe('on-target')
    expect(evaluateCall({ ...base, projected: 55 })).toBe('on-target')
  })

  test('above the band is ease off', () => {
    expect(evaluateCall({ ...base, projected: 70 })).toBe('ease-off')
  })

  test('three or more over-range excursions force ease off', () => {
    expect(evaluateCall({ ...base, projected: 20, excursionsToday: 3 })).toBe('ease-off')
    expect(evaluateCall({ ...base, projected: 20, excursionsToday: 2 })).toBe('room-to-push')
  })

  test('pain of 5 or more today, or a lot of swelling last night, forces ease off', () => {
    expect(evaluateCall({ ...base, projected: 20, maxPainToday: 5 })).toBe('ease-off')
    expect(evaluateCall({ ...base, projected: 20, lastNightSwelling: 'a-lot' })).toBe('ease-off')
    expect(evaluateCall({ ...base, projected: 20, lastNightSwelling: 'some' })).toBe('room-to-push')
  })

  test('a flare-up in the last 24 h downgrades room to push to on target, nothing else', () => {
    expect(evaluateCall({ ...base, projected: 20, flareUpInLast24h: true })).toBe('on-target')
    expect(evaluateCall({ ...base, projected: 70, flareUpInLast24h: true })).toBe('ease-off')
  })

  test('low wear coverage means not enough data, once an hour of the day has passed', () => {
    expect(evaluateCall({ ...base, wearCoverage: 0.3 })).toBe('not-enough-data')
    expect(evaluateCall({ ...base, wearCoverage: 0.3, elapsedActiveMinutes: 20 })).toBe('on-target')
  })

  test('not enough data outranks every override', () => {
    expect(evaluateCall({ ...base, wearCoverage: 0.1, excursionsToday: 5, maxPainToday: 9 })).toBe('not-enough-data')
  })

  test('without a band there is no target', () => {
    expect(evaluateCall({ ...base, band: undefined })).toBe('no-target')
  })
})

describe('projectEndOfDay', () => {
  const profileDays = [
    { endOfDay: 50, atHour: Array.from({ length: 24 }, (_, h) => Math.max(0, Math.min(50, (h - 7) * 5))) },
    { endOfDay: 60, atHour: Array.from({ length: 24 }, (_, h) => Math.max(0, Math.min(60, (h - 7) * 6))) },
    { endOfDay: 40, atHour: Array.from({ length: 24 }, (_, h) => Math.max(0, Math.min(40, (h - 7) * 4))) },
  ]

  test('adds the median remainder for this hour from history', () => {
    // at hour 12: remainders are 50-25=25, 60-30=30, 40-20=20 → median 25
    expect(projectEndOfDay({ scoreSoFar: 30, hour: 12, history: profileDays, band })).toBe(55)
  })

  test('with no history, early in the day it projects to at least the band centre', () => {
    expect(projectEndOfDay({ scoreSoFar: 5, hour: 8, history: [], band })).toBe(45)
    expect(projectEndOfDay({ scoreSoFar: 50, hour: 8, history: [], band })).toBe(50)
  })

  test('with no history, later in the day it scales the so-far score by the day fraction', () => {
    // hour 14.5 is halfway through 07:00..22:00 → fraction 0.5 → projected = 20 / 0.5 = 40
    expect(projectEndOfDay({ scoreSoFar: 20, hour: 14.5, history: [], band })).toBe(40)
  })

  test('after the active day ends the projection is the score itself', () => {
    expect(projectEndOfDay({ scoreSoFar: 48, hour: 23, history: profileDays, band })).toBe(48)
  })

  test('never projects below the so-far score and never above 100', () => {
    expect(projectEndOfDay({ scoreSoFar: 90, hour: 12, history: profileDays, band })).toBeGreaterThanOrEqual(90)
    expect(projectEndOfDay({ scoreSoFar: 95, hour: 10, history: [], band })).toBeLessThanOrEqual(100)
  })

  test('without a band and no history it falls back to the so-far score early in the day', () => {
    expect(projectEndOfDay({ scoreSoFar: 5, hour: 8, history: [], band: undefined })).toBe(5)
  })
})
