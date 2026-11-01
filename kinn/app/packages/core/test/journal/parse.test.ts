import { parseJournal } from '../../src/journal/parse'
import { containsBannedWord } from '../../src/copy/banned'

const FIGMA = 'Practice was ninety minutes, mostly shooting. Knee got a bit sore on cuts to the left, maybe a three. Iced after.'

describe('parseJournal', () => {
  test('sorts the Figma voice entry into activity, pain and recovery', () => {
    const r = parseJournal(FIGMA)
    expect(r.activity).toEqual({ activity: 'practice', intensity: 'moderate', minutes: 90, detail: 'shooting' })
    expect(r.pain).toEqual({ pain: 3, context: 'On cuts to the left' })
    expect(r.recovery).toEqual(['Iced after'])
  })

  test('reads games, gym, PT and rest, and hard or light effort words', () => {
    expect(parseJournal('Full game tonight, went hard, 40 minutes').activity).toEqual({ activity: 'game', intensity: 'hard', minutes: 40 })
    expect(parseJournal('easy gym session, just upper body').activity?.intensity).toBe('light')
    expect(parseJournal('PT this morning, lots of step ups').activity?.activity).toBe('pt')
    expect(parseJournal('Rest day, mostly on the couch').activity?.activity).toBe('rest')
    expect(parseJournal('walked to class and took the stairs').activity?.activity).toBe('walking')
  })

  test('takes digit pain and caps it at 10, and finds no pain when none is said', () => {
    expect(parseJournal('pain was about 7 after').pain?.pain).toBe(7)
    expect(parseJournal('hurt like a 12').pain?.pain).toBe(10)
    expect(parseJournal('Practice felt great').pain).toBeUndefined()
  })

  test('summary line is plain and clean', () => {
    const r = parseJournal(FIGMA)
    expect(r.summary).toBe('Practice · shooting, 90 min. Pain 3. Iced after.')
    expect(containsBannedWord(r.summary)).toBe(false)
  })
})
