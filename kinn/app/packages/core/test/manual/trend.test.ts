import { milestones, progressPercent } from '../../src/manual/trend'
import type { RomDay } from '../../src/manual/types'

const rom = (date: string, extensionDeficitDeg: number, flexionDeg: number): RomDay => ({
  date,
  extensionDeficitDeg,
  flexionDeg,
  source: 'reco-tape-sim',
})

describe('progressPercent', () => {
  test('is 0 with no data and 100 at full range', () => {
    expect(progressPercent(undefined, 0)).toBe(0)
    expect(progressPercent(rom('d', 0, 135), 36)).toBe(100)
  })
  test('weights straightening, bending and time on the comeback timeline', () => {
    expect(progressPercent(rom('d', 0, 90), 0)).toBe(35)
    expect(progressPercent(rom('d', 0, 90), 18)).toBe(50)
  })
  test('clamps beyond the targets', () => {
    expect(progressPercent(rom('d', 30, 60), 0)).toBe(0)
    expect(progressPercent(rom('d', 0, 150), 99)).toBe(100)
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
