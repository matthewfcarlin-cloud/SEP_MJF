import { reasonFor } from '../../src/load/reason'
import { BANNED_WORDS, containsBannedWord } from '../../src/copy/banned'
import type { ReasonInput } from '../../src/load/reason'

const band = { lower: 35, upper: 55, source: 'protocol' as const }

const base: ReasonInput = {
  call: 'on-target',
  score: 40,
  band,
  components: { walking: { units: 3000, count: 3000 }, pt: { units: 1800, count: 400 } },
  excursions: 0,
  hour: 15,
  partial: false,
}

describe('reasonFor', () => {
  test('names the biggest component and its share for a normal day', () => {
    const r = reasonFor({ ...base, call: 'ease-off', score: 60, components: { pt: { units: 6000, count: 600 }, walking: { units: 1200, count: 1200 } } })
    expect(r).toMatch(/PT/)
    expect(r).toMatch(/83%/)
  })

  test('room to push mentions what there is room for', () => {
    const r = reasonFor({ ...base, call: 'room-to-push', score: 15, components: { walking: { units: 1800, count: 1800 } } })
    expect(r.toLowerCase()).toMatch(/room/)
  })

  test('excursions are mentioned when present, in neutral language', () => {
    const r = reasonFor({ ...base, call: 'ease-off', excursions: 3 })
    expect(r).toMatch(/3 bends past this week's range/)
  })

  test('not enough data says so and does not judge', () => {
    const r = reasonFor({ ...base, call: 'not-enough-data', partial: true })
    expect(r.toLowerCase()).toMatch(/coin/)
  })

  test('no target explains the stage', () => {
    const r = reasonFor({ ...base, call: 'no-target', band: undefined })
    expect(r.toLowerCase()).toMatch(/no target yet/)
  })

  test('early in the day with little data reads as early, not as a verdict', () => {
    const r = reasonFor({ ...base, call: 'on-target', score: 3, hour: 8, components: { walking: { units: 300, count: 300 } } })
    expect(r.toLowerCase()).toMatch(/early/)
  })

  test('never contains a banned word in any call state', () => {
    const calls = ['room-to-push', 'on-target', 'ease-off', 'not-enough-data', 'no-target'] as const
    for (const call of calls) {
      for (const excursions of [0, 1, 4]) {
        const r = reasonFor({ ...base, call, excursions })
        expect(containsBannedWord(r), `${call}: ${r}`).toBe(false)
      }
    }
  })
})

describe('banned words list', () => {
  test('includes the words the spec bans and flags them case-insensitively', () => {
    for (const w of ['compliance', 'adherence', 'missed', 'streak', 'unsafe', 're-tear', 'cleared']) {
      expect(BANNED_WORDS).toContain(w)
    }
    expect(containsBannedWord('Your Adherence this week')).toBe(true)
    expect(containsBannedWord('You have room to push')).toBe(false)
  })

  test('matches whole words only, so "monitor" does not flag "RangeMonitor" in code but flags prose', () => {
    expect(containsBannedWord('We monitor you')).toBe(true)
    expect(containsBannedWord('RangeMonitor')).toBe(false)
  })
})
