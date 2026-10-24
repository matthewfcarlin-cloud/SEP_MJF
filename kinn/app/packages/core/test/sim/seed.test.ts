import { deriveToday } from '../../src/manual/derive'
import { seedDataset, SEED_DAYS } from '../../src/sim/seed'
import { containsBannedWord } from '../../src/copy/banned'

const TODAY = '2026-10-26'

describe('seedDataset', () => {
  const data = seedDataset(TODAY)
  const view = deriveToday(data, TODAY)

  test('covers 21 days and leaves today open for the check-in and settle cards', () => {
    expect(data.activityLogs).toHaveLength(SEED_DAYS)
    expect(data.romDays).toHaveLength(SEED_DAYS)
    expect(data.checkIns).toHaveLength(SEED_DAYS)
    expect(view.checkInDone).toBe(false)
    expect(view.pendingSettle).toHaveLength(1)
    expect(view.pendingSettle[0]?.pain).toBe(4)
  })

  test('has four flare-ups and the game-day insight fires first', () => {
    expect(view.flares).toHaveLength(4)
    expect(view.insights.length).toBeGreaterThanOrEqual(2)
    expect(view.insights[0]?.text).toBe('3 of your last 4 flare-ups came after game days.')
  })

  test('today reads Steady before the check-in, and still Steady after a clean one because yesterday was a hard practice', () => {
    expect(view.status).toEqual({ status: 'steady', because: 'load-spike' })
    const after = deriveToday({ ...data, checkIns: [...data.checkIns, { date: TODAY, pain: 1, swelling: 'none' }] }, TODAY)
    expect(after.status).toEqual({ status: 'steady', because: 'load-spike' })
  })

  test('progress is in the 60s and full straightening has been reached', () => {
    expect(view.progressPercent).toBeGreaterThanOrEqual(55)
    expect(view.progressPercent).toBeLessThanOrEqual(80)
    expect(view.milestones.map((m) => m.kind)).toContain('full-straightening')
    expect(view.milestones.map((m) => m.kind)).toContain('bike-range')
  })

  test('is deterministic', () => {
    expect(seedDataset(TODAY)).toEqual(seedDataset(TODAY))
  })

  test('all generated copy is clean', () => {
    expect(containsBannedWord(view.suggestion)).toBe(false)
    for (const i of view.insights) expect(containsBannedWord(i.text)).toBe(false)
  })
})
