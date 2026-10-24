import { shareBody, shareText, weeklySummary } from '../../src/report/weekly'
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

  test('share text has the disclaimer and no banned words', () => {
    const text = shareText(summary, 'Maya')
    expect(text).toContain('does not replace your physio')
    expect(text).toContain('Sessions recorded')
    expect(containsBannedWord(shareBody(summary, 'Maya'))).toBe(false)
  })
})
