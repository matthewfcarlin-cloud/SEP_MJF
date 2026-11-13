/**
 * Where am I in recovery? Pure functions over protocol data + the person's measurements.
 *
 * Rule (from the source protocols): you leave a phase only when
 *   (a) every required exit criterion is met, AND
 *   (b) the next phase's time floor has passed.
 * Completed phases are sticky (stored by the app with a date), so a bad swelling day
 * in phase 4 doesn't throw you back to phase 2 — it shows up as a criterion slipping
 * in the phase you're in and as a hold in the daily plan.
 *
 * Projections are "at your current pace" from your own last 14 days. They are never a
 * promise and never shorten a time floor.
 */
import { daysBetween } from '../time/day'
import { EFFUSION_ORDER, PROTOCOLS } from './protocols'
import type { Criterion, EffusionGrade, MeasuredBy, Metric, ProtocolPhase, Protocol, ProtocolId } from './protocols'

export type Value = number | boolean | EffusionGrade

export interface Measurement {
  readonly value: Value
  readonly date: string // YYYY-MM-DD
  readonly by: MeasuredBy
}

export interface RomPoint {
  readonly date: string
  readonly flexionDeg: number
  readonly extensionDeficitDeg: number
}

export interface PathInput {
  readonly protocolId: ProtocolId
  readonly surgeryDate: string
  readonly today: string
  /** Latest value per metric. */
  readonly latest: Partial<Record<Metric, Measurement>>
  /** Daily ROM, oldest first. Used for projections. */
  readonly rom: readonly RomPoint[]
  /** Phases already completed, with the date. Sticky. */
  readonly completed: readonly { readonly phase: number; readonly date: string }[]
  /** PT override: puts the person in this phase regardless of gates. */
  readonly ptPhase?: number
  /** PT override for the tape's bend limit. null = PT removed the limit. */
  readonly ptFlexionMaxDeg?: number | null
  /** Uninjured knee, measured once at onboarding with the tape. */
  readonly otherKnee?: { readonly flexionDeg: number; readonly extensionDeficitDeg: number }
}

export type CriterionStatus = 'met' | 'not-met' | 'unknown'

export interface CriterionView {
  readonly criterion: Criterion
  readonly status: CriterionStatus
  readonly current?: Value
  readonly measuredOn?: string
  /** Only for tape-measured range criteria that aren't met yet. */
  readonly projection?: Projection
  /** The target is above the bend limit currently in force: the surgeon/PT has to lift it first. */
  readonly blockedByLimit?: boolean
}

export interface Projection {
  /** Degrees per day over the last 14 days. */
  readonly ratePerDay: number
  readonly daysLow: number | null
  readonly daysHigh: number | null
  /** 'improving' | 'flat' (under 0.2°/day) | 'not-enough-data' */
  readonly trend: 'improving' | 'flat' | 'not-enough-data'
}

export type PathState =
  | 'working' // criteria not met, within the typical window
  | 'ready-waiting-on-time' // criteria met, next phase floor not reached
  | 'ready' // criteria met and floor passed → app should call advance()
  | 'behind-typical' // past typical window and criteria not met
  | 'needs-pt' // only PT-measured criteria are left
  | 'complete' // last phase, every checkpoint met — PT/surgeon makes the final call

export interface PhaseRow {
  readonly n: number
  readonly name: string
  readonly typicalWeeks: readonly [number, number]
  readonly status: 'done' | 'current' | 'upcoming'
  readonly completedOn?: string
}

export interface PathView {
  readonly protocol: Protocol
  readonly weeksIn: number
  readonly phase: ProtocolPhase
  readonly state: PathState
  readonly criteria: readonly CriterionView[]
  readonly metCount: number
  readonly requiredCount: number
  readonly nextPhaseOpensWeek: number | null
  readonly timeline: readonly PhaseRow[]
  /** What the tape should watch right now. */
  readonly limits: { readonly flexionMaxDeg: number | null; readonly loadedFlexionMaxDeg: number | null; readonly setBy: 'pt' | 'protocol' | 'none' }
  readonly headline: string
  readonly why: string
}

// ---------------------------------------------------------------------------

export const weeksBetween = (a: string, b: string): number => daysBetween(a, b) / 7

function compare(actual: Value, op: Criterion['op'], target: Value): boolean {
  if (typeof target === 'string') {
    const a = EFFUSION_ORDER.indexOf(actual as EffusionGrade)
    const t = EFFUSION_ORDER.indexOf(target)
    if (a < 0) return false
    return op === '<=' ? a <= t : op === '<' ? a < t : op === '>=' ? a >= t : a === t
  }
  if (typeof target === 'boolean') return actual === target
  const n = actual as number
  switch (op) {
    case '<=': return n <= target
    case '<': return n < target
    case '>=': return n >= target
    case '>': return n > target
    case '==': return n === target
  }
}

/** Fill derived metrics (gaps to the other knee) from ROM + onboarding baseline. */
function withDerived(input: PathInput): Partial<Record<Metric, Measurement>> {
  const out: Partial<Record<Metric, Measurement>> = { ...input.latest }
  // Best of the last 3 days, so one stiff morning or one noisy reading doesn't flip a checkpoint.
  const recent3 = input.rom.slice(-3)
  const last = recent3.length ? {
    date: recent3[recent3.length - 1]!.date,
    flexionDeg: Math.max(...recent3.map((r) => r.flexionDeg)),
    extensionDeficitDeg: Math.min(...recent3.map((r) => r.extensionDeficitDeg)),
  } : undefined
  if (last) {
    out.flexionDeg ??= { value: last.flexionDeg, date: last.date, by: 'tape' }
    out.extensionDeficitDeg ??= { value: last.extensionDeficitDeg, date: last.date, by: 'tape' }
    if (input.otherKnee) {
      out.flexionGapToOtherKneeDeg ??= { value: Math.max(0, input.otherKnee.flexionDeg - last.flexionDeg), date: last.date, by: 'tape' }
      out.extensionGapToOtherKneeDeg ??= { value: Math.max(0, last.extensionDeficitDeg - input.otherKnee.extensionDeficitDeg), date: last.date, by: 'tape' }
    }
  }
  return out
}

/** Least-squares slope (deg/day) of a series over the last `window` days. */
function slope(points: readonly { readonly x: number; readonly y: number }[]): number {
  const n = points.length
  const mx = points.reduce((s, p) => s + p.x, 0) / n
  const my = points.reduce((s, p) => s + p.y, 0) / n
  const num = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const den = points.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  return den === 0 ? 0 : num / den
}

export const PROJECTION = { windowDays: 14, minPoints: 5, flatRate: 0.2, band: 0.35 } as const

function project(input: PathInput, c: Criterion): Projection | undefined {
  const isFlex = c.metric === 'flexionDeg' || c.metric === 'flexionGapToOtherKneeDeg'
  const isExt = c.metric === 'extensionDeficitDeg' || c.metric === 'extensionGapToOtherKneeDeg'
  if (!isFlex && !isExt) return undefined
  const recent = input.rom.filter((p) => daysBetween(p.date, input.today) <= PROJECTION.windowDays)
  if (recent.length < PROJECTION.minPoints) return { ratePerDay: 0, daysLow: null, daysHigh: null, trend: 'not-enough-data' }
  const first = recent[0]!.date
  // Express both as "higher is better" degrees.
  const pts = recent.map((p) => ({ x: daysBetween(first, p.date), y: isFlex ? p.flexionDeg : -p.extensionDeficitDeg }))
  const rate = slope(pts)
  const last = recent[recent.length - 1]!
  let target: number
  if (c.metric === 'flexionDeg') target = c.value as number
  else if (c.metric === 'flexionGapToOtherKneeDeg') target = (input.otherKnee?.flexionDeg ?? 135) - (c.value as number)
  else if (c.metric === 'extensionDeficitDeg') target = -(c.value as number)
  else target = -((input.otherKnee?.extensionDeficitDeg ?? 0) + (c.value as number))
  const current = isFlex ? last.flexionDeg : -last.extensionDeficitDeg
  const remaining = target - current
  if (remaining <= 0) return { ratePerDay: rate, daysLow: 0, daysHigh: 0, trend: 'improving' }
  if (rate < PROJECTION.flatRate) return { ratePerDay: rate, daysLow: null, daysHigh: null, trend: 'flat' }
  const days = remaining / rate
  return {
    ratePerDay: Math.round(rate * 10) / 10,
    daysLow: Math.max(1, Math.round(days * (1 - PROJECTION.band))),
    daysHigh: Math.round(days * (1 + PROJECTION.band)),
    trend: 'improving',
  }
}

export function evaluateCriteria(input: PathInput, phase: ProtocolPhase): readonly CriterionView[] {
  const m = withDerived(input)
  return phase.exitCriteria.map((c) => {
    const got = m[c.metric]
    if (!got) return { criterion: c, status: 'unknown' as const }
    const met = compare(got.value, c.op, c.value)
    const projection = met ? undefined : project(input, c)
    return {
      criterion: c,
      status: met ? 'met' as const : 'not-met' as const,
      current: got.value,
      measuredOn: got.date,
      ...(projection ? { projection } : {}),
    }
  })
}

function currentPhaseNumber(input: PathInput, p: Protocol): number {
  if (input.ptPhase) return Math.min(input.ptPhase, p.phases.length)
  const done = input.completed.reduce((mx, c) => Math.max(mx, c.phase), 0)
  return Math.min(done + 1, p.phases.length)
}

/** The app calls this daily; if it returns a phase, store it in `completed`. */
export function advance(input: PathInput): { readonly phase: number; readonly date: string } | null {
  const view = buildPath(input)
  return view.state === 'ready' ? { phase: view.phase.n, date: input.today } : null
}

type Limits = PathView['limits']

function limitsFor(input: PathInput, phase: ProtocolPhase): Limits {
  const fromProtocol = phase.precautions.find((x) => x.flexionMaxDeg !== undefined)?.flexionMaxDeg ?? null
  const loaded = phase.precautions.find((x) => x.loadedFlexionMaxDeg !== undefined)?.loadedFlexionMaxDeg ?? null
  if (input.ptFlexionMaxDeg !== undefined) return { flexionMaxDeg: input.ptFlexionMaxDeg, loadedFlexionMaxDeg: loaded, setBy: 'pt' }
  return { flexionMaxDeg: fromProtocol, loadedFlexionMaxDeg: loaded, setBy: fromProtocol !== null || loaded !== null ? 'protocol' : 'none' }
}

/** A bend goal above the limit in force can't be met until the surgeon or PT lifts the limit. */
function markBlocked(cv: CriterionView, limits: Limits): CriterionView {
  const blocked = cv.status !== 'met' && cv.criterion.metric === 'flexionDeg' && limits.flexionMaxDeg !== null && (cv.criterion.value as number) > limits.flexionMaxDeg
  if (!blocked) return cv
  const { projection: _dropped, ...rest } = cv
  return { ...rest, blockedByLimit: true }
}

interface StateArgs {
  readonly allMet: boolean
  readonly next: ProtocolPhase | null
  readonly floorPassed: boolean
  readonly onlyPtLeft: boolean
  readonly pastTypical: boolean
}

function stateFor({ allMet, next, floorPassed, onlyPtLeft, pastTypical }: StateArgs): PathState {
  if (allMet && !next) return 'complete'
  if (allMet) return floorPassed ? 'ready' : 'ready-waiting-on-time'
  if (onlyPtLeft) return 'needs-pt'
  return pastTypical ? 'behind-typical' : 'working'
}

function timelineFor(input: PathInput, protocol: Protocol, current: number): readonly PhaseRow[] {
  return protocol.phases.map((ph) => {
    const done = input.completed.find((c) => c.phase === ph.n)
    const status = ph.n < current ? 'done' as const : ph.n === current ? 'current' as const : 'upcoming' as const
    return { n: ph.n, name: ph.name, typicalWeeks: ph.typicalWeeks, status, ...(done ? { completedOn: done.date } : {}) }
  })
}

/** Weeks past the end of the typical window before "behind typical" shows. */
export const BEHIND_GRACE_WEEKS = 1

export function buildPath(input: PathInput): PathView {
  const protocol = PROTOCOLS[input.protocolId]
  const weeksIn = Math.max(0, weeksBetween(input.surgeryDate, input.today))
  const n = currentPhaseNumber(input, protocol)
  const phase = protocol.phases[n - 1]!
  const next = protocol.phases[n] ?? null
  const limits = limitsFor(input, phase)
  const criteria = evaluateCriteria(input, phase).map((cv) => markBlocked(cv, limits))
  const required = criteria.filter((c) => c.criterion.required)
  const met = required.filter((c) => c.status === 'met')
  const openLeft = required.filter((c) => c.status !== 'met')
  const state = stateFor({
    allMet: openLeft.length === 0,
    next,
    floorPassed: next ? weeksIn >= next.startsWeek : true,
    onlyPtLeft: openLeft.length > 0 && openLeft.every((c) => c.criterion.measuredBy === 'pt'),
    pastTypical: weeksIn > phase.typicalWeeks[1] + BEHIND_GRACE_WEEKS,
  })
  const { headline, why } = copyFor(state, phase, next, openLeft, weeksIn)
  return {
    protocol, weeksIn: Math.round(weeksIn * 10) / 10, phase, state, criteria,
    metCount: met.length, requiredCount: required.length,
    nextPhaseOpensWeek: next ? next.startsWeek : null,
    timeline: timelineFor(input, protocol, n), limits, headline, why,
  }
}

// ---------------------------------------------------------------------------
// Copy. Plain, encouraging, never a diagnosis, never "safe"/"re-injury" claims.
// ---------------------------------------------------------------------------

function fmtDays(p?: Projection): string {
  if (!p || p.trend !== 'improving' || p.daysLow === null || p.daysHigh === null) return ''
  if (p.daysHigh <= 1) return ' — any day now'
  const lo = p.daysLow, hi = p.daysHigh
  if (hi <= 14) return ` — about ${lo}–${hi} days at your current pace`
  return ` — about ${Math.round(lo / 7)}–${Math.round(hi / 7)} weeks at your current pace`
}

function copyFor(state: PathState, phase: ProtocolPhase, next: ProtocolPhase | null, open: readonly CriterionView[], weeksIn: number): { headline: string; why: string } {
  const first = open[0]
  if (first?.blockedByLimit && state !== 'ready' && state !== 'ready-waiting-on-time') {
    return { headline: phase.name, why: `Next checkpoint is "${first.criterion.label}", but your bend limit is still on. Your surgeon or PT lifts it first — keep under the limit until then.` }
  }
  switch (state) {
    case 'ready':
      return { headline: `You've unlocked ${next!.name}`, why: `You met every checkpoint for ${phase.name}. ${next!.unlocks[0] ?? ''} is next.`.trim() }
    case 'ready-waiting-on-time': {
      const wk = next!.startsWeek
      const left = Math.max(1, Math.ceil(wk - weeksIn))
      return {
        headline: `Checkpoints done — ${next!.name} opens week ${wk}`,
        why: `You're ahead on the numbers. ${left === 1 ? 'This last week is' : `The next ${left} weeks are`} healing time the protocol builds in, so keep doing what's working.`,
      }
    }
    case 'complete':
      return { headline: 'Every checkpoint met', why: 'You have hit every milestone in the protocol. Full play is your surgeon and PT\'s call — bring your report.' }
    case 'needs-pt':
      return { headline: `Ready for your PT to check`, why: `What's left (${open.map((c) => c.criterion.label).join('; ')}) is measured in clinic. Share your report before your next visit.` }
    case 'behind-typical':
      return {
        headline: `Still working on ${phase.name}`,
        why: first
          ? `Most people move on around week ${phase.typicalWeeks[1]}, and plenty of people take longer. ${first.criterion.label} is the checkpoint left${first.projection?.trend === 'flat' ? '. It has levelled off, so it is worth raising with your PT.' : `${fmtDays(first.projection)}. Your PT can help with it.`}`
          : `Most people move on around week ${phase.typicalWeeks[1]}, and plenty of people take longer. Your PT can help find what's holding it.`,
      }
    case 'working':
    default:
      return {
        headline: `${phase.name}`,
        why: first ? `Next checkpoint: ${first.criterion.label}${fmtDays(first.projection)}.` : `Keep going.`,
      }
  }
}
