/**
 * Deterministic personas that walk through a whole recovery day by day, so the UI
 * and copy can be designed against realistic data before the tape exists.
 * Everything produced here must be labelled SAMPLE DATA in the app.
 *
 * Models are simple on purpose: range comes back on an exponential curve toward the
 * other knee, swelling follows a schedule, strength indices climb linearly from the
 * week the PT starts testing. Each persona tweaks one thing to exercise one state.
 */
import { addDays, daysBetween } from '../time/day'
import { advance, buildPath } from './progress'
import type { Measurement, PathInput, PathView, RomPoint } from './progress'
import type { EffusionGrade, Metric, ProtocolId } from './protocols'

export interface Persona {
  readonly id: string
  readonly name: string
  readonly story: string
  readonly protocolId: ProtocolId
  readonly surgeryDate: string
  readonly weeks: number
  readonly otherKnee: { readonly flexionDeg: number; readonly extensionDeficitDeg: number }
  /** Peak bend on day d (before any limit). */
  readonly flexion: (d: number) => number
  readonly extensionDeficit: (d: number) => number
  readonly effusion: (d: number) => EffusionGrade
  /** Days with pain or swelling after exercise. */
  readonly reactionDays?: (d: number) => boolean
  /** Days the person pushes past an active bend limit (by this many degrees). */
  readonly overbend?: (d: number) => number
  /** Day the PT/surgeon lifts the bend limit. */
  readonly limitLiftedDay?: number
  /** Multiplies strength gains (1 = typical). */
  readonly strengthPace?: number
  /** Day the knee gives way; it counts as an episode for the week after. */
  readonly givingWayDay?: number
}

// Seeded noise so runs are identical.
function rng(seed: number): () => number {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) - 0.5
}

const expCurve = (from: number, to: number, tau: number) => (d: number) => to - (to - from) * Math.exp(-d / tau)
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export interface DaySnapshot {
  readonly day: number
  readonly date: string
  readonly view: PathView
  /** What the engine saw that day, so the app's sample data can be built from it. */
  readonly input: PathInput
  readonly limitAlerts: number
}

export interface SimResult {
  readonly persona: Persona
  readonly days: readonly DaySnapshot[]
  readonly transitions: readonly { readonly phase: number; readonly date: string; readonly week: number }[]
  readonly limitAlertDays: readonly string[]
}

export function simulate(p: Persona): SimResult {
  const noise = rng(p.id.length * 7919)
  const rom: RomPoint[] = []
  const completed: { phase: number; date: string }[] = []
  const days: DaySnapshot[] = []
  const alertDays: string[] = []
  const pace = p.strengthPace ?? 1

  for (let d = 0; d <= p.weeks * 7; d++) {
    const date = addDays(p.surgeryDate, d)
    const ptLift = p.limitLiftedDay !== undefined && d >= p.limitLiftedDay

    // Range for today, under whatever limit applies right now.
    const pre = buildPath(input())
    const cap = ptLift ? null : pre.limits.flexionMaxDeg
    let flex = p.flexion(d) + noise() * 3
    // After a limit is lifted, bend comes back gradually (~2.5°/day), not overnight.
    if (p.limitLiftedDay !== undefined && d >= p.limitLiftedDay) flex = Math.min(flex, 90 + 2.5 * (d - p.limitLiftedDay))
    const over = p.overbend?.(d) ?? 0
    let alert = 0
    if (cap !== null) {
      if (over > 0) { flex = cap + over; alert = 1; alertDays.push(date) } else flex = Math.min(flex, cap)
    }
    rom.push({ date, flexionDeg: Math.round(flex), extensionDeficitDeg: Math.max(0, Math.round(p.extensionDeficit(d) + noise())) })

    const today = input()
    const step = advance(today)
    if (step) completed.push(step)
    const after = input()
    days.push({ day: d, date, view: buildPath(after), input: after, limitAlerts: alert })

    function input(): PathInput {
      const latest: Partial<Record<Metric, Measurement>> = {}
      const put = (m: Metric, value: Measurement['value'], by: Measurement['by']) => { latest[m] = { value, date, by } }
      // Morning check-in every day.
      put('effusionGrade', p.effusion(d), 'check-in')
      const reacted = Array.from({ length: 7 }, (_, i) => d - i).some((x) => x >= 0 && (p.reactionDays?.(x) ?? false))
      put('painOrSwellingAfterExercise', reacted, 'check-in')
      const gaveWay = p.givingWayDay !== undefined && d >= p.givingWayDay && d < p.givingWayDay + 7
      put('instabilityEpisodes7d', gaveWay ? 1 : 0, 'check-in')
      // Self-tests in the app.
      if (d >= 5) put('quadActivationFullExtension', true, 'self-test')
      if (d >= 8) put('slrNoLag', true, 'self-test')
      if (d >= 35) put('jointPositionErrorDeg', clamp(9 - (d - 35) / 4, 2, 9), 'self-test')
      if (d >= 63) put('singleLegSquats60', Math.min(15, Math.floor((d - 63) / 2 * pace)), 'self-test')
      if (d >= 63) put('koosSportPct', clamp(58 + (d - 63) * 0.45 * pace, 0, 98), 'self-test')
      if (d >= 150) put('ikdcScore', clamp(80 + (d - 150) * 0.25 * pace, 0, 99), 'self-test')
      if (d >= 150) put('aclRsiPct', clamp(70 + (d - 150) * 0.3 * pace, 0, 100), 'self-test')
      // PT, weekly visit (latest value carries until the next visit).
      const visit = d - (d % 7)
      if (visit >= 42) put('normalGait', true, 'pt')
      if (visit >= 63) {
        const idx = clamp(62 + (visit - 63) * 0.65 * pace, 0, 100)
        put('quadIndexPct', Math.round(idx), 'pt')
        put('hamstringIndexPct', Math.round(idx + 4), 'pt')
        put('gluteIndexPct', Math.round(idx + 6), 'pt')
        put('hqRatioPct', Math.round(clamp(58 + (visit - 63) * 0.12, 0, 80)), 'pt')
      }
      if (visit >= 91) put('hopLsiPct', Math.round(clamp(70 + (visit - 91) * 0.3 * pace, 0, 100)), 'pt')
      if (visit >= 140) put('runProgramDonePainFree', !reacted, 'pt')
      if (visit >= 154) put('mdClearance', true, 'pt')
      return {
        protocolId: p.protocolId, surgeryDate: p.surgeryDate, today: date, latest, rom: [...rom], completed: [...completed],
        otherKnee: p.otherKnee, ...(ptLift ? { ptFlexionMaxDeg: null } : {}),
      }
    }
  }
  return {
    persona: p, days,
    transitions: completed.map((c) => ({ ...c, week: Math.round(daysBetween(p.surgeryDate, c.date) / 7 * 10) / 10 })),
    limitAlertDays: alertDays,
  }
}

const effusionSchedule = (pts: readonly [number, EffusionGrade][]) => (d: number): EffusionGrade =>
  [...pts].reverse().find(([day]) => d >= day)?.[1] ?? pts[0]![1]

const START = '2026-09-07'

export const PERSONAS: readonly Persona[] = [
  {
    id: 'maya-on-track', name: 'Maya', story: 'ACL reconstruction (patellar tendon), soccer. Textbook recovery.',
    protocolId: 'acl-reconstruction', surgeryDate: START, weeks: 40, otherKnee: { flexionDeg: 140, extensionDeficitDeg: 0 },
    flexion: expCurve(70, 141, 13), extensionDeficit: expCurve(6, -1, 5),
    effusion: effusionSchedule([[0, '2+'], [7, '1+'], [21, 'trace'], [49, 'zero']]),
  },
  {
    id: 'jordan-fast', name: 'Jordan', story: 'ACL reconstruction, basketball. Gets range back fast, so the time floors do the holding.',
    protocolId: 'acl-reconstruction', surgeryDate: START, weeks: 14, otherKnee: { flexionDeg: 138, extensionDeficitDeg: 0 },
    flexion: expCurve(85, 140, 6), extensionDeficit: expCurve(3, -1, 3),
    effusion: effusionSchedule([[0, '1+'], [10, 'trace'], [28, 'zero']]),
  },
  {
    id: 'sam-stuck-bend', name: 'Sam', story: 'ACL reconstruction, skiing. Bend stalls around 115° until week 9, then picks up.',
    protocolId: 'acl-reconstruction', surgeryDate: START, weeks: 16, otherKnee: { flexionDeg: 140, extensionDeficitDeg: 0 },
    flexion: (d) => (d < 63 ? Math.min(115, expCurve(65, 125, 12)(d)) : 115 + (139 - 115) * (1 - Math.exp(-(d - 63) / 10))),
    extensionDeficit: expCurve(7, -1, 6),
    effusion: effusionSchedule([[0, '2+'], [10, '1+'], [28, 'trace'], [56, 'zero']]),
  },
  {
    id: 'priya-meniscus', name: 'Priya', story: 'Meniscus repair, volleyball. Pushes past the 90° limit three times in week 2. Surgeon lifts the limit at week 5.',
    protocolId: 'meniscus-repair', surgeryDate: START, weeks: 14, otherKnee: { flexionDeg: 142, extensionDeficitDeg: 0 },
    flexion: expCurve(60, 140, 10), extensionDeficit: expCurve(5, -1, 4),
    effusion: effusionSchedule([[0, '1+'], [12, 'trace'], [30, 'zero']]),
    overbend: (d) => ([9, 11, 13].includes(d) ? 8 : 0), limitLiftedDay: 35,
  },
  {
    id: 'leo-flare', name: 'Leo', story: 'ACL reconstruction, football. On track until he overdoes it in week 7: swelling and next-day pain for a week.',
    protocolId: 'acl-reconstruction', surgeryDate: START, weeks: 18, otherKnee: { flexionDeg: 139, extensionDeficitDeg: 0 },
    flexion: expCurve(72, 140, 12), extensionDeficit: expCurve(5, -1, 5),
    effusion: (d) => (d >= 49 && d < 63 ? '2+' : effusionSchedule([[0, '2+'], [7, '1+'], [21, 'trace'], [49, 'zero']])(d)),
    reactionDays: (d) => d >= 49 && d < 56,
  },
  {
    id: 'ava-gave-way', name: 'Ava', story: 'ACL reconstruction, netball. On track at week 10, then her knee gives way on the stairs.',
    protocolId: 'acl-reconstruction', surgeryDate: START, weeks: 16, otherKnee: { flexionDeg: 141, extensionDeficitDeg: 0 },
    flexion: expCurve(74, 141, 11), extensionDeficit: expCurve(5, -1, 5),
    effusion: effusionSchedule([[0, '2+'], [7, '1+'], [21, 'trace'], [49, 'zero']]),
    givingWayDay: 70,
  },
]
