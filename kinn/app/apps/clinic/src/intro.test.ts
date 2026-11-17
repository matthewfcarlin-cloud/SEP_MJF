import { shouldPlayIntro } from './intro'

describe('the coin opening', () => {
  test('plays the first time a session opens the site', () => {
    expect(shouldPlayIntro({ seen: false, reducedMotion: false, forced: false })).toBe(true)
  })

  test('does not play again in the same session', () => {
    expect(shouldPlayIntro({ seen: true, reducedMotion: false, forced: false })).toBe(false)
  })

  test('never plays for a reader who asked for less motion', () => {
    expect(shouldPlayIntro({ seen: false, reducedMotion: true, forced: false })).toBe(false)
  })

  test('plays when asked for by name, for a demo', () => {
    expect(shouldPlayIntro({ seen: true, reducedMotion: true, forced: true })).toBe(true)
  })
})
