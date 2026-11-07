import { hasRedFlagWords, personalLine, redFlag, warningFor } from '../../src/warnings/line'
import { containsBannedWord } from '../../src/copy/banned'
import type { DayLoad, FlareDay } from '../../src/manual/types'

const loads: DayLoad[] = [
  { date: '2026-10-01', units: 0, score: 90 },
  { date: '2026-10-05', units: 0, score: 60 },
  { date: '2026-10-09', units: 0, score: 80 },
]
const flares: FlareDay[] = [
  { date: '2026-10-02', reason: 'morning-pain' },
  { date: '2026-10-06', reason: 'swelling' },
  { date: '2026-10-10', reason: 'did-not-settle' },
]

describe('personalLine', () => {
  test('is the median load the day before a flare-up', () => {
    expect(personalLine(loads, flares, 40, [], '2026-10-20')).toEqual({ score: 80, source: 'personal', flaresUsed: 3, loosenedBy: 0 })
  })
  test('starts from the usual day plus a margin with too few flare-ups', () => {
    expect(personalLine(loads, flares.slice(0, 1), 40, [], '2026-10-20').score).toBe(52)
    expect(personalLine([], [], 0, [], '2026-10-20').score).toBe(70)
  })
  test('"that was wrong" loosens it, up to a cap', () => {
    const fb = Array.from({ length: 5 }, (_, i) => ({ date: '2026-10-1' + i, t: 0, kind: 'wrong' as const }))
    expect(personalLine(loads, flares, 40, fb.slice(0, 1), '2026-10-20').score).toBe(88)
    expect(personalLine(loads, flares, 40, fb, '2026-10-20').score).toBe(104)
  })
})

describe('warningFor', () => {
  const line = personalLine(loads, flares, 40, [], '2026-10-20')
  test('says nothing well under the line, warns when close, and when over', () => {
    expect(warningFor({ todayScore: 50, line, signalOk: true, dismissedToday: false })).toBeUndefined()
    expect(warningFor({ todayScore: 70, line, signalOk: true, dismissedToday: false })?.level).toBe('approaching')
    const over = warningFor({ todayScore: 85, line, signalOk: true, dismissedToday: false })!
    expect(over.level).toBe('over')
    expect(over.why).toBe('Your last 3 flare-ups came after days around 80. Today is at 85.')
    for (const s of [over.title, over.why, over.suggestion]) expect(containsBannedWord(s)).toBe(false)
  })
  test('never fires on a bad signal or once dismissed today', () => {
    expect(warningFor({ todayScore: 99, line, signalOk: false, dismissedToday: false })).toBeUndefined()
    expect(warningFor({ todayScore: 99, line, signalOk: true, dismissedToday: true })).toBeUndefined()
  })
})

describe('redFlag', () => {
  test('a pain of 8+ or the joint giving way today', () => {
    expect(redFlag([{ id: 'a', t: 0, date: 'd', pain: 8 }], 'd')?.id).toBe('a')
    expect(redFlag([{ id: 'b', t: 0, date: 'd', pain: 4, note: 'knee gave way on a cut' }], 'd')?.id).toBe('b')
    expect(redFlag([{ id: 'c', t: 0, date: 'd', pain: 5, note: 'sore' }], 'd')).toBeUndefined()
  })
})

describe('hasRedFlagWords', () => {
  test.each(['it gave way on the stairs', 'my knee locked', 'felt it pop, it popped', 'my foot went numb', "can't straighten it"])('flags "%s"', (t) => {
    expect(hasRedFlagWords(t)).toBe(true)
  })
  test.each(['pain number 3 after the walk', 'I was locked in at practice', 'numbers look good'])('leaves "%s" alone', (t) => {
    expect(hasRedFlagWords(t)).toBe(false)
  })
})
