import { meterFor, METER_RULES, loggedDays } from '../../src/manual/meter'
import { emptyDataset } from '../../src/manual/derive'
import type { RomDay } from '../../src/manual/types'

const TODAY = '2026-11-06'
const rom = (date: string): RomDay => ({ date, extensionDeficitDeg: 0, flexionDeg: 125, source: 'pt' })

describe('meterFor', () => {
  test('builds until there is a range and enough logged days', () => {
    expect(meterFor(50, [], 5, TODAY)).toEqual({ kind: 'building', hasRange: false, loggedDays: 5, daysNeeded: METER_RULES.minLoggedDays })
    expect(meterFor(50, [rom('2026-11-05')], 2, TODAY).kind).toBe('building')
  })
  test('shows normally with a recent measurement', () => {
    const m = meterFor(72, [rom('2026-10-20'), rom('2026-11-01')], 3, TODAY)
    expect(m.kind).toBe('normal')
    if (m.kind !== 'building') expect(m.lastMeasured.date).toBe('2026-11-01')
  })
  test('fades after 21 days without a new measurement', () => {
    expect(meterFor(72, [rom('2026-10-16')], 9, TODAY).kind).toBe('normal')
    expect(meterFor(72, [rom('2026-10-15')], 9, TODAY).kind).toBe('stale')
  })
})

describe('loggedDays', () => {
  test('counts each date with any record once, including a tap with no rating', () => {
    const data = {
      ...emptyDataset(TODAY),
      activityLogs: [{ id: 'a', date: '2026-11-01', activity: 'gym' as const, intensity: 'light' as const }],
      painLogs: [{ id: 'p', t: 1, date: '2026-11-01' }, { id: 'q', t: 2, date: '2026-11-02' }],
      checkIns: [{ date: '2026-11-03', pain: 1, swelling: 'none' as const }],
    }
    expect(loggedDays(data)).toEqual(['2026-11-01', '2026-11-02', '2026-11-03'])
  })
})
