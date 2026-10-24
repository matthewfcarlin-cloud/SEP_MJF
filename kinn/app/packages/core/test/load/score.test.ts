import { scoreFromUnits, sumComponents } from '../../src/load/score'
import { HEALTHY_DAY_UNITS } from '../../src/load/constants'

describe('scoreFromUnits', () => {
  test('zero units is zero', () => {
    expect(scoreFromUnits(0)).toBe(0)
  })

  test('a full healthy day is 100', () => {
    expect(scoreFromUnits(HEALTHY_DAY_UNITS)).toBe(100)
  })

  test('is linear below the cap and rounded to an integer', () => {
    expect(scoreFromUnits(HEALTHY_DAY_UNITS / 4)).toBe(25)
    expect(scoreFromUnits(HEALTHY_DAY_UNITS * 0.333)).toBe(33)
  })

  test('is pinned at 100 above the cap', () => {
    expect(scoreFromUnits(HEALTHY_DAY_UNITS * 3)).toBe(100)
  })

  test('is monotonic in units', () => {
    let last = -1
    for (let u = 0; u <= HEALTHY_DAY_UNITS * 1.5; u += 97) {
      const s = scoreFromUnits(u)
      expect(s).toBeGreaterThanOrEqual(last)
      last = s
    }
  })

  test('negative units are treated as zero rather than throwing', () => {
    expect(scoreFromUnits(-5)).toBe(0)
  })
})

describe('sumComponents', () => {
  test('accumulates units and counts per component without mutating the input', () => {
    const start = { walking: { units: 1, count: 1 } }
    const next = sumComponents(start, [
      { component: 'walking', units: 2 },
      { component: 'stairs', units: 3 },
    ])
    expect(next).toEqual({ walking: { units: 3, count: 2 }, stairs: { units: 3, count: 1 } })
    expect(start).toEqual({ walking: { units: 1, count: 1 } })
  })
})
