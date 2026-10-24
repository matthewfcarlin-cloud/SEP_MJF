import { flareUps, insightsFor, loadContrast } from '../../src/manual/insights'
import { containsBannedWord } from '../../src/copy/banned'
import type { ActivityLog, DayLoad, MorningCheckIn, PainLog } from '../../src/manual/types'

const dates = Array.from({ length: 10 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`)
const checkIn = (date: string, pain: number, swelling: MorningCheckIn['swelling'] = 'none'): MorningCheckIn => ({ date, pain, swelling })

describe('flareUps', () => {
  test('counts high morning pain, swelling a lot, and pain that did not settle, once per date', () => {
    const checkIns = [checkIn('2026-10-02', 6), checkIn('2026-10-04', 1, 'a-lot'), checkIn('2026-10-05', 1)]
    const pain: PainLog[] = [{ id: 'p', t: 0, date: '2026-10-01', pain: 6, settled: 'no' }, { id: 'q', t: 0, date: '2026-10-03', pain: 7, settled: 'yes' }]
    expect(flareUps(checkIns, pain).map((f) => f.date)).toEqual(['2026-10-02', '2026-10-04'])
  })
})

describe('insightsFor', () => {
  const logs: ActivityLog[] = [
    { id: 'a', date: '2026-10-01', activity: 'game', intensity: 'hard' },
    { id: 'b', date: '2026-10-03', activity: 'game', intensity: 'hard' },
    { id: 'c', date: '2026-10-05', activity: 'gym', intensity: 'moderate' },
    { id: 'd', date: '2026-10-07', activity: 'game', intensity: 'hard' },
  ]
  const loads: DayLoad[] = dates.map((date) => ({ date, units: 0, score: logs.some((l) => l.date === date && l.activity === 'game') ? 90 : 20 }))
  const flares = [
    { date: '2026-10-02', reason: 'morning-pain' as const },
    { date: '2026-10-04', reason: 'morning-pain' as const },
    { date: '2026-10-06', reason: 'swelling' as const },
    { date: '2026-10-08', reason: 'morning-pain' as const },
  ]

  test('shows nothing with fewer than two flare-ups', () => {
    expect(insightsFor({ flares: flares.slice(0, 1), logs, loads, dates, baselineScore: 30 })).toEqual([])
  })

  test('finds the game-day pattern and phrases it as an observation', () => {
    const out = insightsFor({ flares, logs, loads, dates, baselineScore: 30 })
    expect(out[0]?.text).toBe('3 of your last 4 flare-ups came after game days.')
    expect(out.map((o) => o.id)).not.toContain('after-gym')
    for (const o of out) expect(containsBannedWord(o.text)).toBe(false)
  })

  test('uses "All" when every flare-up matches', () => {
    const out = insightsFor({ flares: flares.filter((f) => f.date !== '2026-10-06'), logs, loads, dates, baselineScore: 30 })
    expect(out[0]?.text).toBe('All 3 of your flare-ups came after game days.')
  })

  test('drops conditions that restate the same flare-ups as a rarer one', () => {
    const out = insightsFor({ flares, logs, loads, dates, baselineScore: 30 })
    const sets = out.map((o) => o.matchedDates.join('|'))
    expect(new Set(sets).size).toBe(sets.length)
    expect(out).toHaveLength(1)
  })

  test('load contrast compares the day before flare-ups with the day before other mornings', () => {
    const c = loadContrast({ flares, logs, loads, dates, baselineScore: 30 })
    expect(c?.beforeFlareAvg).toBeGreaterThan(c?.otherDaysAvg ?? 0)
    expect(c?.text).toContain('averaged')
    expect(containsBannedWord(c?.text ?? '')).toBe(false)
    expect(loadContrast({ flares: flares.slice(0, 1), logs, loads, dates, baselineScore: 30 })).toBeUndefined()
  })

  test('drops a condition that held on more than half of all days', () => {
    const everyDayGame: ActivityLog[] = dates.map((date, i) => ({ id: String(i), date, activity: 'game', intensity: 'hard' }))
    const out = insightsFor({ flares, logs: everyDayGame, loads, dates, baselineScore: 30 })
    expect(out.map((o) => o.id)).not.toContain('after-game')
  })
})
