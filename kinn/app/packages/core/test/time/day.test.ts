import { addDays, dayKey, elapsedActiveMinutes, hourOf, localDateKey, wearCoverage, weeksSince } from '../../src/time/day'

const local = (y: number, m: number, d: number, h: number, min = 0): number => new Date(y, m - 1, d, h, min, 0, 0).getTime()

describe('dayKey', () => {
  test('a late evening belongs to that calendar day', () => {
    expect(dayKey(local(2026, 10, 19, 23, 30))).toBe('2026-10-19')
  })

  test('01:00 still belongs to the previous day because the day rolls at 04:00', () => {
    expect(dayKey(local(2026, 10, 20, 1, 0))).toBe('2026-10-19')
    expect(dayKey(local(2026, 10, 20, 3, 59))).toBe('2026-10-19')
  })

  test('04:00 starts the new day', () => {
    expect(dayKey(local(2026, 10, 20, 4, 0))).toBe('2026-10-20')
  })

  test('localDateKey is the plain calendar date', () => {
    expect(localDateKey(local(2026, 1, 5, 1))).toBe('2026-01-05')
  })
})

describe('hourOf and the active day', () => {
  test('hourOf is fractional', () => {
    expect(hourOf(local(2026, 10, 19, 14, 30))).toBeCloseTo(14.5)
  })

  test('elapsedActiveMinutes clamps to the 07:00..22:00 window', () => {
    expect(elapsedActiveMinutes(local(2026, 10, 19, 6, 0))).toBe(0)
    expect(elapsedActiveMinutes(local(2026, 10, 19, 8, 0))).toBe(60)
    expect(elapsedActiveMinutes(local(2026, 10, 19, 23, 0))).toBe(900)
  })

  test('wearCoverage is worn minutes over elapsed, clamped, and 1 before the day starts', () => {
    expect(wearCoverage(30, local(2026, 10, 19, 8, 0))).toBeCloseTo(0.5)
    expect(wearCoverage(999, local(2026, 10, 19, 8, 0))).toBe(1)
    expect(wearCoverage(0, local(2026, 10, 19, 5, 0))).toBe(1)
  })
})

describe('date arithmetic', () => {
  test('addDays crosses month boundaries', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02')
    expect(addDays('2026-11-02', -3)).toBe('2026-10-30')
  })

  test('weeksSince counts fractional weeks from a surgery date', () => {
    const now = local(2026, 10, 19, 12)
    expect(weeksSince('2026-08-10', now)).toBeCloseTo(10, 1)
  })
})
