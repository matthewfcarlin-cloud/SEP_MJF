import { segmentAll, segmentStep, initialSegmenterState } from '../../src/pipeline/segmenter'
import { applyCalibration, medianFilterStep } from '../../src/pipeline/filter'
import type { KneeSample } from '../../src/domain/types'

const th = { deepThresholdDeg: 110, limitDeg: 135 }

/** Sinusoidal bends between trough and peak at a rate of cycles per minute, sampled at hz. */
function bends(opts: { count: number; trough: number; peak: number; ratePerMin: number; hz?: number; accelG?: number; startT?: number }): KneeSample[] {
  const hz = opts.hz ?? 25
  const periodMs = 60_000 / opts.ratePerMin
  const total = Math.round((opts.count * periodMs * hz) / 1000)
  const start = opts.startT ?? 1_000_000
  const out: KneeSample[] = []
  for (let i = 0; i <= total; i++) {
    const t = start + Math.round((i * 1000) / hz)
    const phase = (2 * Math.PI * (t - start)) / periodMs
    const angle = opts.trough + (opts.peak - opts.trough) * (0.5 - 0.5 * Math.cos(phase))
    const atStrike = phase % (2 * Math.PI) < 0.3
    out.push({ t, angleDeg: angle, shinAccelG: atStrike ? (opts.accelG ?? 1.1) : 1.0 })
  }
  return out
}

describe('segmentAll', () => {
  test('counts one cycle per sinusoidal bend', () => {
    const cycles = segmentAll(bends({ count: 10, trough: 5, peak: 60, ratePerMin: 55 }), th)
    expect(cycles.length).toBeGreaterThanOrEqual(9)
    expect(cycles.length).toBeLessThanOrEqual(10)
    const first = cycles[0]!
    expect(first.peakDeg).toBeGreaterThan(55)
    expect(first.troughDeg).toBeLessThan(10)
  })

  test('ignores wobble smaller than 30 degrees', () => {
    const cycles = segmentAll(bends({ count: 10, trough: 5, peak: 25, ratePerMin: 55 }), th)
    expect(cycles).toHaveLength(0)
  })

  test('records deep flexion time and peak acceleration', () => {
    const cycles = segmentAll(bends({ count: 3, trough: 5, peak: 125, ratePerMin: 15, accelG: 1.2 }), th)
    expect(cycles.length).toBeGreaterThanOrEqual(2)
    for (const c of cycles) {
      expect(c.deepFlexionMs).toBeGreaterThan(500)
      expect(c.peakAccelG).toBeGreaterThanOrEqual(1.2)
    }
  })

  test('flags an over-range cycle only when the angle stays past limit plus margin for half a second', () => {
    // peak 150 held for about 1.6 s of a 4 s cycle → over range
    const deep = segmentAll(bends({ count: 2, trough: 5, peak: 150, ratePerMin: 15 }), th)
    expect(deep.some((c) => c.overRange)).toBe(true)
    // peak 138 is within the 5 degree margin of a 135 limit → not over range
    const edge = segmentAll(bends({ count: 2, trough: 5, peak: 138, ratePerMin: 15 }), th)
    expect(edge.every((c) => !c.overRange)).toBe(true)
  })

  test('no range limit means nothing is ever over range', () => {
    const cycles = segmentAll(bends({ count: 2, trough: 5, peak: 150, ratePerMin: 15 }), { deepThresholdDeg: 110, limitDeg: null })
    expect(cycles.every((c) => !c.overRange)).toBe(true)
  })

  test('classifies rhythmic shallow bends as walking and slow deep bends as bends', () => {
    const walk = segmentAll(bends({ count: 6, trough: 5, peak: 60, ratePerMin: 55 }), th)
    expect(walk.slice(1).every((c) => c.activity === 'walking')).toBe(true)
    const squats = segmentAll(bends({ count: 4, trough: 5, peak: 120, ratePerMin: 15 }), th)
    expect(squats.slice(1).every((c) => c.activity === 'bend')).toBe(true)
  })

  test('segmentStep never mutates the state it is given', () => {
    const s0 = initialSegmenterState
    const frozen = Object.freeze({ ...s0 })
    const r = segmentStep(frozen, { t: 1, angleDeg: 5, shinAccelG: 1 }, th)
    expect(r.state).not.toBe(frozen)
    expect(frozen).toEqual(s0)
  })
})

describe('filter', () => {
  test('applyCalibration subtracts the offset, honours the sign, and clamps', () => {
    const cal = { zeroOffsetDeg: 4, signFlipped: false, at: 'x' }
    expect(applyCalibration({ t: 0, angleDeg: 64, shinAccelG: 1 }, cal).angleDeg).toBe(60)
    expect(applyCalibration({ t: 0, angleDeg: -64, shinAccelG: 1 }, { ...cal, signFlipped: true }).angleDeg).toBe(60)
    expect(applyCalibration({ t: 0, angleDeg: 400, shinAccelG: 1 }, cal).angleDeg).toBe(160)
  })

  test('median filter removes a single spike without mutating the window', () => {
    let w: readonly number[] = [10, 10, 10, 10]
    const before = [...w]
    const r = medianFilterStep(w, 90)
    expect(r.angleDeg).toBe(10)
    expect(w).toEqual(before)
    w = r.window
    expect(w).toHaveLength(5)
  })
})
