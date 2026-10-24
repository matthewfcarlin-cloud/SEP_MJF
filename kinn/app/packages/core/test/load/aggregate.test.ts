import { aggregateDay, componentsFor } from '../../src/load/aggregate'
import { MODEL_VERSION } from '../../src/load/constants'
import type { BendCycle } from '../../src/domain/types'

const walk = (i: number, extra: Partial<BendCycle> = {}): BendCycle => ({
  id: `w${i}`,
  startT: i * 1000,
  endT: i * 1000 + 900,
  peakDeg: 60,
  troughDeg: 5,
  peakAccelG: 1.1,
  activity: 'walking',
  deepFlexionMs: 0,
  overRange: false,
  ...extra,
})

const band = { lower: 35, upper: 55, source: 'protocol' as const }

const base = {
  date: '2026-10-19',
  excursionCount: 0,
  band,
  wearCoverage: 1,
  elapsedActiveMinutes: 480,
  hour: 15,
  history: [],
  flareUpInLast24h: false,
}

describe('aggregateDay', () => {
  test('an empty day scores zero and carries the model version', () => {
    const d = aggregateDay({ ...base, cycles: [] })
    expect(d.score).toBe(0)
    expect(d.rawUnits).toBe(0)
    expect(d.modelVersion).toBe(MODEL_VERSION)
    expect(d.band).toEqual(band)
  })

  test('3000 walking cycles is a quarter of a healthy day', () => {
    const cycles = Array.from({ length: 3000 }, (_, i) => walk(i))
    const d = aggregateDay({ ...base, cycles })
    expect(d.score).toBe(25)
    expect(d.components.walking).toEqual({ units: 3000, count: 3000 })
  })

  test('the breakdown separates PT from the same movements outside a session', () => {
    const cycles = [
      ...Array.from({ length: 100 }, (_, i) => walk(i)),
      ...Array.from({ length: 100 }, (_, i) => walk(1000 + i, { sessionKind: 'pt' })),
    ]
    const c = componentsFor(cycles)
    expect(c.walking?.units).toBe(100)
    expect(c.pt?.units).toBe(150)
  })

  test('a heavy afternoon projects past the band and reads ease off', () => {
    const cycles = Array.from({ length: 6000 }, (_, i) => walk(i))
    const d = aggregateDay({ ...base, cycles, hour: 14.5 })
    expect(d.score).toBe(50)
    expect(d.call).toBe('ease-off')
    expect(d.reason).toMatch(/walking/i)
  })

  test('low coverage marks the day partial with not enough data', () => {
    const d = aggregateDay({ ...base, cycles: [walk(1)], wearCoverage: 0.2 })
    expect(d.partial).toBe(true)
    expect(d.call).toBe('not-enough-data')
  })

  test('excursions flow through to the call, the count and the reason', () => {
    const d = aggregateDay({ ...base, cycles: [walk(1)], excursionCount: 3 })
    expect(d.excursions).toBe(3)
    expect(d.call).toBe('ease-off')
    expect(d.reason).toMatch(/3 bends/)
  })

  test('omits the band key entirely when there is no band', () => {
    const d = aggregateDay({ ...base, cycles: [], band: undefined })
    expect('band' in d).toBe(false)
    expect(d.call).toBe('no-target')
  })
})
