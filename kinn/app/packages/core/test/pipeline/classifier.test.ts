import { classifyCycle, cycleRate, withSession } from '../../src/pipeline/classifier'

const draft = (peakDeg: number, peakAccelG = 1.1) => ({
  id: 'c',
  startT: 0,
  endT: 1000,
  peakDeg,
  troughDeg: 5,
  peakAccelG,
  deepFlexionMs: 0,
  overRange: false,
})

describe('classifyCycle', () => {
  test('impact wins regardless of angle or rate', () => {
    expect(classifyCycle(draft(80, 3.5), 80)).toBe('impact')
    expect(classifyCycle(draft(40, 2.5), 10)).toBe('impact')
  })

  test('shallow rhythmic cycles are walking', () => {
    expect(classifyCycle(draft(60), 55)).toBe('walking')
    expect(classifyCycle(draft(70), 40)).toBe('walking')
  })

  test('mid-range rhythmic low-impact cycles are cycling', () => {
    expect(classifyCycle(draft(100, 1.0), 80)).toBe('cycling')
  })

  test('mid-range slower cycles with a foot strike are stairs', () => {
    expect(classifyCycle(draft(95, 1.6), 30)).toBe('stairs')
  })

  test('slow deep cycles are bends', () => {
    expect(classifyCycle(draft(120), 15)).toBe('bend')
    expect(classifyCycle(draft(95, 1.0), 5)).toBe('bend')
  })

  test('with no rate yet, angle alone decides between walking and bend', () => {
    expect(classifyCycle(draft(60), undefined)).toBe('walking')
    expect(classifyCycle(draft(120), undefined)).toBe('bend')
  })

  test('odd combinations are unknown rather than guessed', () => {
    expect(classifyCycle(draft(60), 10)).toBe('unknown')
  })
})

describe('cycleRate', () => {
  test('converts the gap between cycle starts to cycles per minute', () => {
    expect(cycleRate(0, 1000)).toBe(60)
    expect(cycleRate(undefined, 1000)).toBeUndefined()
    expect(cycleRate(1000, 1000)).toBeUndefined()
  })
})

describe('withSession', () => {
  const cycle = { ...draft(60), activity: 'walking' as const }

  test('tags a cycle inside a session and leaves others alone', () => {
    const sessions = [{ kind: 'pt' as const, startedAt: 0, endedAt: 5000 }]
    expect(withSession({ ...cycle, startT: 100 }, sessions).sessionKind).toBe('pt')
    expect(withSession({ ...cycle, startT: 6000 }, sessions).sessionKind).toBeUndefined()
  })

  test('an open session (no end) covers everything after its start', () => {
    expect(withSession({ ...cycle, startT: 99_999 }, [{ kind: 'training' as const, startedAt: 10 }]).sessionKind).toBe('training')
  })
})
