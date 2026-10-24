import { unitsForCycle } from '../../src/load/units'
import { BASE_UNITS, OVER_RANGE_UNITS, SESSION_MULTIPLIER } from '../../src/load/constants'
import type { BendCycle } from '../../src/domain/types'

const cycle = (over: Partial<BendCycle> = {}): BendCycle => ({
  id: 'c1',
  startT: 0,
  endT: 1000,
  peakDeg: 60,
  troughDeg: 5,
  peakAccelG: 1.1,
  activity: 'walking',
  deepFlexionMs: 0,
  overRange: false,
  ...over,
})

describe('unitsForCycle', () => {
  test('a walking cycle earns one base unit attributed to walking', () => {
    const r = unitsForCycle(cycle())
    expect(r.total).toBeCloseTo(BASE_UNITS.walking)
    expect(r.parts).toEqual([{ component: 'walking', units: 1 }])
  })

  test('stairs and bends earn three units each, cycling half a unit', () => {
    expect(unitsForCycle(cycle({ activity: 'stairs', peakDeg: 95 })).total).toBeCloseTo(3)
    expect(unitsForCycle(cycle({ activity: 'bend', peakDeg: 120 })).total).toBeCloseTo(3)
    expect(unitsForCycle(cycle({ activity: 'cycling', peakDeg: 100 })).total).toBeCloseTo(0.5)
  })

  test('impact adds 1.5 units per g above 1.5 g and is attributed to impact', () => {
    // 3.5 g → base 1 + 1.5 * (3.5 - 1.5) = 4
    const r = unitsForCycle(cycle({ activity: 'impact', peakAccelG: 3.5, peakDeg: 80 }))
    expect(r.total).toBeCloseTo(4)
    expect(r.parts).toEqual([{ component: 'impact', units: 4 }])
  })

  test('impact units never drop below the minimum once the threshold is crossed', () => {
    // 2.6 g → 1.5 * 1.1 = 1.65 > min, fine; 2.5 g is exactly threshold → treated as impact with min
    const r = unitsForCycle(cycle({ activity: 'impact', peakAccelG: 2.5 }))
    expect(r.total).toBeGreaterThanOrEqual(1 + 0.5)
  })

  test('cycles inside a PT session are multiplied and attributed to pt', () => {
    const r = unitsForCycle(cycle({ activity: 'stairs', peakDeg: 95, sessionKind: 'pt' }))
    expect(r.total).toBeCloseTo(3 * SESSION_MULTIPLIER)
    expect(r.parts[0]).toEqual({ component: 'pt', units: 4.5 })
  })

  test('deep flexion time adds one unit per 10 s in its own component, not multiplied', () => {
    const r = unitsForCycle(cycle({ activity: 'bend', peakDeg: 125, deepFlexionMs: 20_000, sessionKind: 'training' }))
    const deep = r.parts.find((p) => p.component === 'deepFlexion')
    expect(deep?.units).toBeCloseTo(2)
    expect(r.total).toBeCloseTo(3 * SESSION_MULTIPLIER + 2)
  })

  test('an over-range cycle adds the flat over-range units', () => {
    const r = unitsForCycle(cycle({ activity: 'bend', peakDeg: 140, overRange: true }))
    const over = r.parts.find((p) => p.component === 'overRange')
    expect(over?.units).toBe(OVER_RANGE_UNITS)
    expect(r.total).toBeCloseTo(3 + OVER_RANGE_UNITS)
  })

  test('does not mutate its input', () => {
    const c = cycle()
    const copy = { ...c }
    unitsForCycle(c)
    expect(c).toEqual(copy)
  })
})
