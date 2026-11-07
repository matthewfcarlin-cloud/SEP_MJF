import { dailyRead, warningCopy } from '../../src/guidance/read'
import { deriveToday, emptyDataset } from '../../src/manual/derive'
import type { Dataset } from '../../src/manual/types'
import { containsBannedWord } from '../../src/copy/banned'

const TODAY = '2026-11-06'
const empty = emptyDataset(TODAY)
const withLogs: Dataset = {
  ...empty,
  activityLogs: [
    { id: 'a1', date: '2026-11-03', activity: 'practice', intensity: 'moderate' },
    { id: 'a2', date: '2026-11-04', activity: 'gym', intensity: 'moderate' },
    { id: 'a3', date: '2026-11-05', activity: 'walking', intensity: 'light' },
  ],
}

describe('dailyRead', () => {
  test('shows no word on the first day, even after a check-in', () => {
    const data = { ...empty, checkIns: [{ date: TODAY, pain: 2, swelling: 'none' as const }] }
    const read = dailyRead(deriveToday(data, TODAY), 'descriptive')
    expect(read.stage).toBe('first-day')
    expect(read.word).toBeUndefined()
    expect(read.facts).toContain('tomorrow')
  })

  test('gives facts so far and no word until the check-in', () => {
    const read = dailyRead(deriveToday(withLogs, TODAY), 'descriptive')
    expect(read.stage).toBe('no-check-in')
    expect(read.word).toBeUndefined()
    expect(read.facts).toContain('after your check-in')
  })

  test('says Mixed, Settled and Flared below Guided, with facts and no suggestion', () => {
    const at = (pain: number) => dailyRead(deriveToday({ ...withLogs, checkIns: [{ date: TODAY, pain, swelling: 'none' }] }, TODAY), 'descriptive')
    expect(at(0).word).toBe('Settled')
    expect(at(3).word).toBe('Mixed')
    expect(at(7).word).toBe('Flared')
    expect(at(3).facts).toContain('Morning pain 3')
    expect(at(3).suggestion).toBeUndefined()
  })

  test('uses the status words and one suggestion only at Guided', () => {
    const read = dailyRead(deriveToday({ ...withLogs, checkIns: [{ date: TODAY, pain: 7, swelling: 'none' }] }, TODAY), 'guided')
    expect(read.word).toBe('Ease off')
    expect(read.suggestion).toBeTruthy()
  })

  test('compares morning pain with a rating from last night', () => {
    const data: Dataset = {
      ...withLogs,
      checkIns: [{ date: TODAY, pain: 6, swelling: 'none' }],
      painLogs: [{ id: 'p', t: 1, date: '2026-11-05', pain: 3 }],
    }
    expect(dailyRead(deriveToday(data, TODAY), 'descriptive').facts).toContain('up from 3 last night')
  })

  test('leaves out the usual until there is one', () => {
    const data: Dataset = {
      ...empty,
      activityLogs: [{ id: 'a', date: '2026-11-05', activity: 'gym', intensity: 'hard' }],
      checkIns: [{ date: TODAY, pain: 1, swelling: 'none' }],
    }
    expect(dailyRead(deriveToday(data, TODAY), 'descriptive').facts).not.toContain('usual')
  })
})

describe('warningCopy', () => {
  const warning = { level: 'over' as const, score: 85, line: 80, title: 't', why: 'Your last 3 flare-ups came after days around 80. Today is at 85.', suggestion: 'Keep the rest of today light.' }
  const line = { score: 80, source: 'personal' as const, flaresUsed: 3, loosenedBy: 0 }

  test('stays to the facts at Descriptive', () => {
    const c = warningCopy(warning, line, 'descriptive')
    expect(c.action).toBeUndefined()
    expect(c.facts).toBe(warning.why)
  })
  test('adds a PT line at PT-led and the suggestion at Guided', () => {
    expect(warningCopy(warning, line, 'pt-led').action).toContain('PT')
    expect(warningCopy(warning, line, 'guided').action).toBe(warning.suggestion)
  })
  test('explains which line it is using', () => {
    expect(warningCopy(warning, line, 'descriptive').lineNote).toContain('flare-ups')
    expect(warningCopy(warning, { ...line, source: 'starting', flaresUsed: 0 }, 'descriptive').lineNote).toContain('usual')
  })
  test('has no banned words', () => {
    const c = warningCopy(warning, line, 'pt-led')
    expect(containsBannedWord(`${c.facts} ${c.action} ${c.lineNote}`)).toBe(false)
  })
})
