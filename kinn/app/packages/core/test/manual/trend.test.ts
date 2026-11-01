import { capacityProgress, milestones, progressChange, progressPercent } from '../../src/manual/trend'
import type { RomDay } from '../../src/manual/types'

const rom = (date: string, extensionDeficitDeg: number, flexionDeg: number): RomDay => ({
  date,
  extensionDeficitDeg,
  flexionDeg,
  source: 'reco-tape-sim',
})

describe('progressPercent', () => {
  test('is 0 with no data and 100 at full range and full capacity', () => {
    expect(progressPercent(undefined, 0)).toBe(0)
    expect(progressPercent(rom('d', 0, 135), 1)).toBe(100)
  })
  test('weights straightening, bending and capacity; time alone moves nothing', () => {
    expect(progressPercent(rom('d', 0, 90), 0)).toBe(35)
    expect(progressPercent(rom('d', 0, 90), 0.5)).toBe(50)
  })
  test('uses capacity alone without range data', () => {
    expect(progressPercent(undefined, 0.6)).toBe(60)
  })
  test('clamps beyond the targets', () => {
    expect(progressPercent(rom('d', 30, 60), 0)).toBe(0)
    expect(progressPercent(rom('d', 0, 150), 3)).toBe(100)
  })
})

describe('capacityProgress', () => {
  const loads = [
    { date: '2026-10-01', units: 1, score: 70 },
    { date: '2026-10-02', units: 1, score: 35 },
    { date: '2026-10-03', units: 0, score: 0 },
  ]
  test('averages logged days and counts a day as zero when a flare-up followed it', () => {
    expect(capacityProgress(loads, new Set(), '2026-10-04')).toBeCloseTo(0.75)
    expect(capacityProgress(loads, new Set(['2026-10-02']), '2026-10-04')).toBeCloseTo(0.25)
    expect(capacityProgress([], new Set(), '2026-10-04')).toBe(0)
  })
})

describe('progressChange', () => {
  test('names why the meter moved', () => {
    expect(progressChange(60, 64, 0, 1)).toEqual({ delta: -4, reason: 'flare' })
    expect(progressChange(64, 60, 3, 0)).toEqual({ delta: 4, reason: 'range' })
    expect(progressChange(64, 60, 0, 0)).toEqual({ delta: 4, reason: 'capacity' })
    expect(progressChange(60, 60, 0, 0)).toEqual({ delta: 0, reason: 'flat' })
  })
})

describe('milestones', () => {
  test('reports the first day each target was reached, in order', () => {
    const days = [rom('2026-10-03', 5, 100), rom('2026-10-01', 7, 95), rom('2026-10-05', 1, 118), rom('2026-10-07', 0, 121)]
    expect(milestones(days)).toEqual([
      { kind: 'full-straightening', date: '2026-10-05', label: 'Full straightening reached' },
      { kind: 'bike-range', date: '2026-10-07', label: 'Bike range reached (120°)' },
    ])
  })
  test('is empty when nothing was reached', () => {
    expect(milestones([rom('d', 6, 100)])).toEqual([])
  })
})
