/**
 * Every protocol string a person can see, and every headline and why the engine writes
 * across all personas, against the banned list plus the protocol-specific rules:
 * RECO never clears anyone, never promises a date, never talks about re-injury.
 */
import { findBannedWords } from '../../src/copy/banned'
import { PROTOCOLS } from '../../src/protocol/protocols'
import { PERSONAS, simulate } from '../../src/protocol/simulate'

const PATH_BANNED = /\b(safe|safely|cleared?|clears|ready to return|re-?injur\w*|at risk|allowed)\b/i

function protocolStrings(): readonly string[] {
  return Object.values(PROTOCOLS).flatMap((p) => [
    p.name,
    ...p.phases.flatMap((ph) => [ph.name, ...ph.goals, ...ph.unlocks, ...ph.precautions.map((x) => x.label), ...ph.exitCriteria.map((c) => c.label)]),
  ])
}

function engineStrings(): readonly string[] {
  const out = new Set<string>()
  for (const p of PERSONAS) for (const d of simulate(p).days) out.add(d.view.headline).add(d.view.why)
  return [...out]
}

const offenders = (xs: readonly string[]): readonly string[] =>
  xs.filter((s) => findBannedWords(s).length > 0 || PATH_BANNED.test(s))

describe('protocol path copy', () => {
  test('protocol labels, goals and precautions are clean', () => {
    expect(offenders(protocolStrings())).toEqual([])
  })

  test('every headline and why across all personas is clean', () => {
    const all = engineStrings()
    expect(all.length).toBeGreaterThan(20)
    expect(offenders(all)).toEqual([])
  })

  test('projections say "at your current pace" and never give a date', () => {
    const projections = engineStrings().filter((s) => /\d+.\d+ (days|weeks)/.test(s))
    expect(projections.length).toBeGreaterThan(0)
    for (const s of projections) expect(s).toContain('at your current pace')
    for (const s of engineStrings()) expect(s).not.toMatch(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* \d/)
  })

  test('behind-typical copy normalises it and points to the PT', () => {
    const behind = PERSONAS.flatMap((p) => simulate(p).days).filter((d) => d.view.state === 'behind-typical')
    expect(behind.length).toBeGreaterThan(0)
    for (const d of behind) {
      expect(d.view.why).toContain('plenty of people take longer')
      expect(d.view.why).toContain('PT')
    }
  })
})
