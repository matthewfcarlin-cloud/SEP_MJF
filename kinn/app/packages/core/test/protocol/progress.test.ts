import { describe, expect, it } from 'vitest'
import { buildPath } from '../../src/protocol/progress'
import type { PathInput } from '../../src/protocol/progress'
import { PERSONAS, simulate } from '../../src/protocol/simulate'

const base = (over: Partial<PathInput> = {}): PathInput => ({
  protocolId: 'acl-reconstruction', surgeryDate: '2026-09-07', today: '2026-09-14',
  latest: {}, rom: [], completed: [], otherKnee: { flexionDeg: 140, extensionDeficitDeg: 0 }, ...over,
})
const rom = (date: string, flexionDeg: number, extensionDeficitDeg: number) => ({ date, flexionDeg, extensionDeficitDeg })

describe('phase gates', () => {
  it('meeting criteria early does not skip the time floor', () => {
    const v = buildPath(base({
      today: '2026-09-15', // week 1.1, phase 2 opens week 2
      rom: [rom('2026-09-15', 100, 0)],
      latest: { quadActivationFullExtension: { value: true, date: '2026-09-15', by: 'self-test' }, slrNoLag: { value: true, date: '2026-09-15', by: 'self-test' } },
    }))
    expect(v.state).toBe('ready-waiting-on-time')
  })

  it('passing the floor does not skip criteria', () => {
    const v = buildPath(base({ today: '2026-10-05', rom: [rom('2026-10-05', 110, 4)] })) // week 4, still bent 4°
    expect(v.phase.n).toBe(1)
    expect(v.state).toBe('behind-typical')
    expect(v.criteria.find((c) => c.criterion.id === 'acl1-ext')?.status).toBe('not-met')
  })

  it('unknown values are unknown, not failed', () => {
    const v = buildPath(base())
    expect(v.criteria.every((c) => c.status === 'unknown')).toBe(true)
  })

  it('PT override wins for phase and bend limit', () => {
    const v = buildPath(base({ protocolId: 'meniscus-repair', ptPhase: 3, ptFlexionMaxDeg: 110 }))
    expect(v.phase.n).toBe(3)
    expect(v.limits).toMatchObject({ flexionMaxDeg: 110, setBy: 'pt' })
  })

  it('meniscus repair keeps the 90° tape limit in phases 1-2 and flags a 120° goal as blocked', () => {
    const v = buildPath(base({ protocolId: 'meniscus-repair', today: '2026-10-05', completed: [{ phase: 1, date: '2026-09-28' }], rom: [rom('2026-10-05', 90, 0)] }))
    expect(v.limits.flexionMaxDeg).toBe(90)
    expect(v.criteria.find((c) => c.criterion.id === 'men2-flex')?.blockedByLimit).toBe(true)
  })
})

describe('projection', () => {
  it('projects from the last 14 days and says flat when progress stalls', () => {
    const days = Array.from({ length: 10 }, (_, i) => rom(`2026-09-${String(20 + i).padStart(2, '0')}`, 115, 0))
    const v = buildPath(base({ today: '2026-09-29', completed: [{ phase: 1, date: '2026-09-21' }], rom: days }))
    const flex = v.criteria.find((c) => c.criterion.id === 'acl2-flex')
    expect(flex?.projection?.trend).toBe('flat')
  })

  it('gives a day range when improving', () => {
    const days = Array.from({ length: 10 }, (_, i) => rom(`2026-09-${String(20 + i).padStart(2, '0')}`, 100 + i * 2, 0))
    const v = buildPath(base({ today: '2026-09-29', completed: [{ phase: 1, date: '2026-09-21' }], rom: days }))
    const p = v.criteria.find((c) => c.criterion.id === 'acl2-flex')?.projection
    expect(p?.trend).toBe('improving')
    expect(p?.daysLow).toBeGreaterThan(0)
    expect(p!.daysHigh!).toBeGreaterThanOrEqual(p!.daysLow!)
  })
})

describe('personas', () => {
  const run = (id: string) => simulate(PERSONAS.find((p) => p.id === id)!)
  it('never enters a phase before its time floor', () => {
    for (const p of PERSONAS) {
      const r = simulate(p)
      for (const t of r.transitions) {
        const nextFloor = [0, 2, 6, 9, 13, 26][t.phase]!
        expect(t.week).toBeGreaterThanOrEqual(nextFloor)
      }
    }
  })
  it('Sam is held in phase 2 by a stalled bend', () => {
    const r = run('sam-stuck-bend')
    expect(r.transitions.find((t) => t.phase === 2)!.week).toBeGreaterThan(9)
  })
  it('Priya triggers bend-limit alerts only while the limit is on', () => {
    expect(run('priya-meniscus').limitAlertDays).toHaveLength(3)
  })
})
