import { shareBody, shareText, weekChange, weekHeadline, weeklySummary } from '../../src/report/weekly'
import { seedDataset } from '../../src/sim/seed'
import { containsBannedWord } from '../../src/copy/banned'

describe('weeklySummary', () => {
  const data = seedDataset('2026-10-26')
  const summary = weeklySummary(data, '2026-10-25')

  test('covers exactly seven days ending on the given day', () => {
    expect(summary.weekStart).toBe('2026-10-19')
    expect(summary.days).toHaveLength(7)
    expect(summary.days.at(-1)?.date).toBe('2026-10-25')
  })

  test('counts sessions and range for the week', () => {
    expect(summary.activityCounts.game).toBe(1)
    expect(summary.peakFlexionDeg).toBeGreaterThan(120)
    expect(summary.flares.length).toBeGreaterThanOrEqual(1)
  })

  test('marks each morning and lists the day’s activities', () => {
    expect(summary.rows).toHaveLength(7)
    expect(summary.rows.map((r) => r.morning)).toContain('flare')
    expect(summary.rows.map((r) => r.morning)).toContain('clear')
    expect(summary.rows.some((r) => r.activities.includes('game'))).toBe(true)
    expect(summary.avgScore).toBeGreaterThan(0)
  })

  test('compares with the week before and writes a clean headline', () => {
    const change = weekChange(data, '2026-10-25')
    expect(typeof change.avgScoreDelta).toBe('number')
    expect(change.flexionDeltaDeg).toBeGreaterThan(0)
    const headline = weekHeadline(summary, change)
    expect(headline).toMatch(/^[A-Z]/)
    expect(headline).toContain('flare-up')
    expect(headline).toContain('straightened fully')
    expect(containsBannedWord(headline)).toBe(false)
  })

  test('share text has the disclaimer and no banned words', () => {
    const text = shareText(summary, 'Maya')
    expect(text).toContain('does not replace your physio')
    expect(text).toContain('Sessions recorded')
    expect(containsBannedWord(shareBody(summary, 'Maya'))).toBe(false)
  })
})
