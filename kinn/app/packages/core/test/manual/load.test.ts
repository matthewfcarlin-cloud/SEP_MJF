import { baselineScore, dayLoad, unitsForLog } from '../../src/manual/load'
import type { ActivityLog } from '../../src/manual/types'

const log = (date: string, activity: ActivityLog['activity'], intensity: ActivityLog['intensity']): ActivityLog => ({
  id: `${date}-${activity}`,
  date,
  activity,
  intensity,
})

describe('manual load', () => {
  test('a hard game scores high and a rest day scores near zero', () => {
    expect(dayLoad('2026-10-01', [log('2026-10-01', 'game', 'hard')]).score).toBeGreaterThanOrEqual(85)
    expect(dayLoad('2026-10-01', [log('2026-10-01', 'rest', 'light')]).score).toBeLessThanOrEqual(5)
  })

  test('units add across logs on the same day and ignore other days', () => {
    const logs = [log('2026-10-01', 'pt', 'moderate'), log('2026-10-01', 'walking', 'light'), log('2026-10-02', 'game', 'hard')]
    expect(dayLoad('2026-10-01', logs).units).toBe(unitsForLog(logs[0]!) + unitsForLog(logs[1]!))
  })

  test('intensity is monotonic for every activity', () => {
    for (const a of ['practice', 'game', 'gym', 'pt', 'walking'] as const) {
      expect(unitsForLog(log('d', a, 'light'))).toBeLessThanOrEqual(unitsForLog(log('d', a, 'moderate')))
      expect(unitsForLog(log('d', a, 'moderate'))).toBeLessThanOrEqual(unitsForLog(log('d', a, 'hard')))
    }
  })

  test('baseline ignores days with no logs', () => {
    expect(
      baselineScore([
        { date: 'a', units: 0, score: 0 },
        { date: 'b', units: 6000, score: 50 },
        { date: 'c', units: 3600, score: 30 },
      ]),
    ).toBe(40)
    expect(baselineScore([])).toBe(0)
  })
})
