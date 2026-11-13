/**
 * The adaptive plan. Phase comes from the protocol checkpoints when the injury has a
 * criterion-based protocol (ACL reconstruction, meniscus repair), otherwise from time
 * since surgery or injury. Either way it then holds
 * back when recent flare-ups disagree. Today's sessions follow the day's status:
 * Keep going gets the full dose, Steady the lighter dose with sport skipped,
 * Ease off a recovery day. It never pushes when the signals disagree.
 */
import { addDays, startOfDay, weeksSince } from '../time/day'
import type { FlareDay, PlanMark, Profile, Status } from '../manual/types'
import { jointOf } from '../manual/types'
import { LIBRARY, PHASE_NAMES, PHASE_WEEKS, RECOVERY_DAY, TYPICAL_RETURN_WEEKS, WEEK_TEMPLATE } from './library'
import type { Exercise, Phase } from './library'
import { libraryPhaseFor } from '../protocol/phase-map'

export const PLAN_RULES = {
  /** Flare-ups within this many days that hold the phase back by one. */
  holdBackWindowDays: 10,
  holdBackFlares: 2,
} as const

export interface PlanItem {
  readonly id: string
  readonly exercise: Exercise
  readonly dose: string
  readonly done: boolean
}

export interface DayPlan {
  readonly date: string
  readonly items: readonly PlanItem[]
  readonly rest: boolean
  /** Why today looks the way it does, in one plain sentence. */
  readonly why: string
}

export interface PlanView {
  readonly phase: Phase
  readonly phaseName: string
  /** Set when recent flare-ups held the phase back. */
  readonly heldBack: boolean
  /** Where the phase came from before any hold-back. */
  readonly phaseFrom: 'checkpoints' | 'time'
  readonly source: 'with-pt' | 'protocol'
  readonly today: DayPlan
  readonly week: readonly DayPlan[]
  readonly doneThisWeek: number
  readonly plannedThisWeek: number
  readonly typicalReturn: { readonly lowWeeks: number; readonly highWeeks: number; readonly weeksIn: number }
}

export function phaseForWeeks(weeks: number, thresholds: readonly [number, number, number]): Phase {
  if (weeks < thresholds[0]) return 1
  if (weeks < thresholds[1]) return 2
  if (weeks < thresholds[2]) return 3
  return 4
}

const recentFlares = (flares: readonly FlareDay[], today: string): number =>
  flares.filter((f) => f.date > addDays(today, -PLAN_RULES.holdBackWindowDays) && f.date <= today).length

function itemsForDay(date: string, kinds: readonly string[], library: readonly Exercise[], status: Status | 'planned', recovery: readonly Exercise[], marks: readonly PlanMark[]): readonly PlanItem[] {
  const isDone = (id: string): boolean => marks.some((m) => m.date === date && m.itemId === id && m.done)
  if (status === 'ease-off') return recovery.map((e) => ({ id: e.id, exercise: e, dose: e.lightDose, done: isDone(e.id) }))
  const picked = library.filter((e) => kinds.includes(e.kind))
  const kept = status === 'steady' ? picked.filter((e) => e.kind !== 'sport') : picked
  return kept.map((e) => ({ id: e.id, exercise: e, dose: status === 'steady' ? e.lightDose : e.dose, done: isDone(e.id) }))
}

const WHY: Readonly<Record<Status, string>> = {
  'keep-going': 'Your knee settled, so today is the full session.',
  steady: 'Holding steady today: lighter sets and no sport drills.',
  'ease-off': 'Pain or swelling is up, so today is a recovery day.',
}

const jointWord = (p: Profile): string => jointOf(p)

export interface PlanInput {
  readonly profile: Profile
  readonly today: string
  readonly status: Status
  readonly flares: readonly FlareDay[]
  readonly marks: readonly PlanMark[]
  /** Current phase on the criterion-based protocol path (1..6), when there is one. */
  readonly protocolPhase?: number
}

export function buildPlan(input: PlanInput): PlanView {
  const { profile, today, status } = input
  const joint = jointOf(profile)
  const weeks = Math.max(0, weeksSince(profile.injuryDate, startOfDay(today, 12)))
  const timePhase = input.protocolPhase !== undefined ? libraryPhaseFor(input.protocolPhase) : phaseForWeeks(weeks, PHASE_WEEKS[profile.injury])
  const heldBack = timePhase > 1 && recentFlares(input.flares, today) >= PLAN_RULES.holdBackFlares
  const phase = (heldBack ? timePhase - 1 : timePhase) as Phase
  const library = LIBRARY[joint][phase]
  const recovery = RECOVERY_DAY[joint]

  const weekStart = addDays(today, -((new Date(startOfDay(today, 12)).getDay() + 6) % 7))
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    const kinds = WEEK_TEMPLATE[new Date(startOfDay(date, 12)).getDay()]!
    const dayStatus: Status | 'planned' = date === today ? status : 'planned'
    const items = itemsForDay(date, kinds, library, dayStatus, recovery, input.marks)
    const why = date === today ? (items.length === 0 ? 'Rest day. A walk is fine if you feel like moving.' : WHY[status]) : ''
    return { date, items, rest: items.length === 0, why: why.replace('knee', jointWord(profile)) }
  })
  const todayPlan = week.find((d) => d.date === today)!
  const upToToday = week.filter((d) => d.date <= today)
  const ret = TYPICAL_RETURN_WEEKS[profile.injury][profile.hadSurgery ? 'surgery' : 'noSurgery']
  return {
    phase,
    phaseName: PHASE_NAMES[phase],
    heldBack,
    phaseFrom: input.protocolPhase !== undefined ? 'checkpoints' : 'time',
    source: profile.hasPt ? 'with-pt' : 'protocol',
    today: todayPlan,
    week,
    doneThisWeek: upToToday.reduce((n, d) => n + d.items.filter((i) => i.done).length, 0),
    plannedThisWeek: upToToday.reduce((n, d) => n + d.items.length, 0),
    typicalReturn: { lowWeeks: ret[0], highWeeks: ret[1], weeksIn: Math.floor(weeks) },
  }
}
