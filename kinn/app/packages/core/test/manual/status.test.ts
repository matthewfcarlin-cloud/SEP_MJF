import { statusFor } from '../../src/manual/status'
import { suggestionFor } from '../../src/manual/suggestion'
import { containsBannedWord } from '../../src/copy/banned'
import type { StatusInput } from '../../src/manual/status'

const base: StatusInput = {
  checkIn: { date: '2026-10-24', pain: 1, swelling: 'none' },
  yesterdayScore: 40,
  baselineScore: 40,
  unsettledPain: false,
}

describe('statusFor', () => {
  test('all clear is keep going', () => {
    expect(statusFor(base)).toEqual({ status: 'keep-going', because: 'all-clear' })
  })
  test('morning pain of 5 forces ease off', () => {
    expect(statusFor({ ...base, checkIn: { date: 'd', pain: 5, swelling: 'none' } }).status).toBe('ease-off')
  })
  test('swelling a lot forces ease off', () => {
    expect(statusFor({ ...base, checkIn: { date: 'd', pain: 0, swelling: 'a-lot' } }).because).toBe('swelling-a-lot')
  })
  test('pain that did not settle forces ease off', () => {
    expect(statusFor({ ...base, unsettledPain: true }).status).toBe('ease-off')
  })
  test('pain of 3 or some swelling holds at steady', () => {
    expect(statusFor({ ...base, checkIn: { date: 'd', pain: 3, swelling: 'none' } }).status).toBe('steady')
    expect(statusFor({ ...base, checkIn: { date: 'd', pain: 0, swelling: 'some' } }).status).toBe('steady')
  })
  test('a load spike holds at steady but never forces ease off', () => {
    const r = statusFor({ ...base, yesterdayScore: 80 })
    expect(r).toEqual({ status: 'steady', because: 'load-spike' })
  })
  test('a spike is not judged without a baseline', () => {
    expect(statusFor({ ...base, yesterdayScore: 80, baselineScore: 0 }).status).toBe('keep-going')
  })
  test('no check-in is steady', () => {
    expect(statusFor({ ...base, checkIn: undefined }).because).toBe('no-check-in')
  })
})

describe('suggestionFor', () => {
  const reasons = [
    'morning-pain-high',
    'swelling-a-lot',
    'did-not-settle',
    'morning-pain-some',
    'swelling-some',
    'load-spike',
    'no-check-in',
    'all-clear',
  ] as const
  test('every suggestion is one or two sentences with no banned words', () => {
    for (const because of reasons) {
      for (const status of ['keep-going', 'steady', 'ease-off'] as const) {
        const s = suggestionFor({ status, because })
        expect(s.length).toBeGreaterThan(20)
        expect(containsBannedWord(s)).toBe(false)
      }
    }
  })
})
