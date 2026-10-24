import { protocolBand, personaliseBand, resolveBand } from '../../src/load/band'

describe('protocolBand', () => {
  test('returns the anchor values exactly on anchor weeks', () => {
    expect(protocolBand(4)).toEqual({ lower: 20, upper: 35, source: 'protocol' })
    expect(protocolBand(12)).toEqual({ lower: 40, upper: 60, source: 'protocol' })
    expect(protocolBand(24)).toEqual({ lower: 65, upper: 90, source: 'protocol' })
  })

  test('interpolates linearly between anchors and rounds', () => {
    // week 5 is halfway between (20,35) and (25,40)
    expect(protocolBand(5)).toEqual({ lower: 23, upper: 38, source: 'protocol' })
    // week 18 between (50,75) and (60,85)
    expect(protocolBand(18)).toEqual({ lower: 55, upper: 80, source: 'protocol' })
  })

  test('rises slowly through the week 10 to 16 window', () => {
    const w10 = protocolBand(10)!
    const w16 = protocolBand(16)!
    expect(w16.upper - w10.upper).toBeLessThanOrEqual(20)
  })

  test('has no protocol band outside weeks 4 to 24', () => {
    expect(protocolBand(3)).toBeUndefined()
    expect(protocolBand(25)).toBeUndefined()
  })

  test('accepts fractional weeks', () => {
    const b = protocolBand(10.5)!
    expect(b.lower).toBeGreaterThanOrEqual(35)
    expect(b.upper).toBeLessThanOrEqual(58)
  })
})

describe('personaliseBand', () => {
  const protocol = { lower: 40, upper: 60, source: 'protocol' as const }

  test('returns the protocol band unchanged before 14 wear days', () => {
    const history = Array.from({ length: 10 }, () => 30)
    expect(personaliseBand(protocol, history)).toEqual(protocol)
  })

  test('blends the centre 60/40 toward the chronic mean and marks the source', () => {
    // chronic 30 → centre 0.6*50 + 0.4*30 = 42, width 20 → 32..52, then ACWR guard: upper <= 39 → 39, lower >= 24
    const history = Array.from({ length: 20 }, () => 30)
    const b = personaliseBand(protocol, history)
    expect(b.source).toBe('personalised')
    expect(b.upper).toBe(39)
    expect(b.lower).toBe(32)
  })

  test('never lets the acute:chronic guard produce an inverted band', () => {
    // chronic 10: upper <= 13, lower >= 8 but protocol lower 40 → lower would exceed upper
    const history = Array.from({ length: 20 }, () => 10)
    const b = personaliseBand(protocol, history)
    expect(b.lower).toBeLessThanOrEqual(b.upper)
    expect(b.upper - b.lower).toBeGreaterThanOrEqual(5)
  })

  test('uses only the last 28 days of history', () => {
    const old = Array.from({ length: 28 }, () => 90)
    const recent = Array.from({ length: 28 }, () => 50)
    const b = personaliseBand(protocol, [...old, ...recent])
    // chronic should be 50, not 70
    expect(b.upper).toBe(60)
  })
})

describe('resolveBand', () => {
  test('a physio band wins over everything and is not personalised', () => {
    const b = resolveBand({
      weeksSinceSurgery: 10,
      history: Array.from({ length: 30 }, () => 10),
      physioBand: { lower: 30, upper: 45 },
    })
    expect(b).toEqual({ lower: 30, upper: 45, source: 'physio' })
  })

  test('falls back to the protocol band, personalised when enough history exists', () => {
    expect(resolveBand({ weeksSinceSurgery: 10, history: [] })).toEqual({ lower: 35, upper: 55, source: 'protocol' })
    expect(resolveBand({ weeksSinceSurgery: 10, history: Array.from({ length: 20 }, () => 45) })?.source).toBe('personalised')
  })

  test('is undefined outside the protocol window with no physio band', () => {
    expect(resolveBand({ weeksSinceSurgery: 30, history: [] })).toBeUndefined()
  })
})
