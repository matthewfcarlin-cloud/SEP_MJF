/**
 * The recovery plan as a record. A plan a PT writes (on the clinic site) or a patient types in
 * from their PT is a fact: stored, versioned, and what the backend syncs. RECO's own plan is
 * derived (plan/build.ts) and never stored, the same rule as everything else in core.
 *
 * Who decides, in order (resolvePlan): the PT's plan, then the plan the patient typed from their
 * PT, then RECO's protocol plan at the Guided level only, otherwise no plan.
 */
import { addDays, startOfDay } from '../time/day'
import type { PlanExercise, PlanMark, Status } from '../manual/types'
import { scheduledWeekdays, weekStartOf } from './typed'

const DAYS_IN_WEEK = 7
const MAX_SETS = 20
const MAX_REPS = 200
const MAX_SECONDS = 600
const MAX_MINUTES = 240

/** A dose as the PT wrote it. Any field may be missing; `note` carries anything the numbers can't. */
export interface Dose {
  readonly sets?: number
  readonly reps?: number
  /** Hold or work time per rep, in seconds. */
  readonly seconds?: number
  readonly minutes?: number
  /** Per leg or per side. */
  readonly perSide?: boolean
  readonly note?: string
}

export interface PlanEntry {
  readonly id: string
  /** A library exercise the PT picked (and may have edited), or one the PT wrote themselves. */
  readonly source: { readonly kind: 'library'; readonly exerciseId: string } | { readonly kind: 'custom' }
  readonly name: string
  readonly how?: string
  readonly dose: Dose
  /** Used on flare-up mornings when the plan allows it; falls back to the full dose. */
  readonly lightDose?: Dose
  /** 1 to 7; spread as evenly as whole days allow, the same way the typed plan does. */
  readonly daysPerWeek: number
}

/**
 * as-written: RECO shows the plan exactly as written, every day.
 * lighter-on-flare: on a flare-up morning (Ease off), RECO swaps in the lighter dose. The PT opts in.
 */
export type PlanAdaptation = 'as-written' | 'lighter-on-flare'

export type PlanAuthor =
  | { readonly kind: 'pt'; readonly name: string }
  /** The patient typed it in from their PT's sheet. */
  | { readonly kind: 'typed' }

export interface RecoveryPlan {
  readonly id: string
  /** Goes up by one each time the plan is published. */
  readonly version: number
  readonly author: PlanAuthor
  readonly adaptation: PlanAdaptation
  readonly entries: readonly PlanEntry[]
  /** Date key the version was published. */
  readonly publishedOn: string
  readonly note?: string
}

export interface ScheduledEntry {
  readonly entry: PlanEntry
  readonly dose: Dose
  readonly lighter: boolean
  readonly done: boolean
}

export interface ScheduledDay {
  readonly date: string
  readonly entries: readonly ScheduledEntry[]
  readonly rest: boolean
  readonly allDone: boolean
}

const unit = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`

/** "3 × 12 each", "3 × 30 s", "15 min", "2 × 10, slow on the way down". */
export function doseText(d: Dose): string {
  const each = d.perSide ? ' each' : ''
  const work = d.reps !== undefined ? `${d.reps}` : d.seconds !== undefined ? `${d.seconds} s` : undefined
  const parts = [
    d.sets !== undefined && work !== undefined ? `${d.sets} × ${work}${each}` : d.sets !== undefined ? `${unit(d.sets, 'set')}${each}` : work !== undefined ? `${work}${each}` : undefined,
    d.reps !== undefined && d.seconds !== undefined ? `${d.seconds} s hold` : undefined,
    d.minutes !== undefined ? `${d.minutes} min` : undefined,
    d.note,
  ].filter((p): p is string => p !== undefined && p !== '')
  return parts.join(', ')
}

/**
 * Reads the library's dose strings ("3 × 12", "3 × 10 each", "3 × 30 s", "10 min", "3 × 10, 5 s hold")
 * into a Dose the PT can edit. Anything it can't read is kept whole as the note.
 */
export function parseDose(text: string): Dose {
  const t = text.trim()
  const setsReps = /^(\d+)\s*×\s*(\d+)(\s*s\b)?(\s*each)?(?:\s*steps)?(?:,\s*(\d+)\s*s hold)?(?:,\s*(.*))?$/i.exec(t)
  if (setsReps) {
    const [, sets, n, isSeconds, each, hold, rest] = setsReps
    const work = isSeconds ? { seconds: Number(n) } : { reps: Number(n) }
    return {
      sets: Number(sets),
      ...work,
      ...(hold ? { seconds: Number(hold) } : {}),
      ...(each ? { perSide: true } : {}),
      ...(rest ? { note: rest } : {}),
    }
  }
  const minutes = /^(\d+)\s*min\b,?\s*(.*)$/i.exec(t)
  if (minutes) return { minutes: Number(minutes[1]), ...(minutes[2] ? { note: minutes[2] } : {}) }
  return { note: t }
}

const inRange = (n: number | undefined, max: number): boolean => n === undefined || (Number.isInteger(n) && n > 0 && n <= max)

/** A plan the backend can accept: named entries, a usable dose each, 1 to 7 days a week. */
export function validatePlan(plan: RecoveryPlan): readonly string[] {
  const problems: string[] = []
  if (plan.version < 1 || !Number.isInteger(plan.version)) problems.push('The version must be a whole number from 1')
  if (plan.author.kind === 'pt' && plan.author.name.trim() === '') problems.push('Add your name, as the patient will see it')
  const ids = new Set<string>()
  plan.entries.forEach((e, i) => {
    const at = `Exercise ${i + 1}`
    if (ids.has(e.id)) problems.push(`${at} repeats another exercise’s id`)
    ids.add(e.id)
    if (e.name.trim() === '') problems.push(`${at} needs a name`)
    if (!Number.isInteger(e.daysPerWeek) || e.daysPerWeek < 1 || e.daysPerWeek > DAYS_IN_WEEK) problems.push(`${at}: days a week must be 1 to 7`)
    for (const d of [e.dose, ...(e.lightDose ? [e.lightDose] : [])]) {
      if (!inRange(d.sets, MAX_SETS) || !inRange(d.reps, MAX_REPS) || !inRange(d.seconds, MAX_SECONDS) || !inRange(d.minutes, MAX_MINUTES)) problems.push(`${at}: a dose number is out of range (sets up to 20, reps up to 200, hold up to 600 s, minutes up to 240)`)
      if (doseText(d) === '') problems.push(`${at} needs a dose`)
    }
  })
  return problems
}

/** The plan a patient typed in from their PT, as a plan record, so both apps read one shape. */
export function planFromTyped(exercises: readonly PlanExercise[], publishedOn: string): RecoveryPlan {
  return {
    id: 'typed',
    version: 1,
    author: { kind: 'typed' },
    adaptation: 'as-written',
    publishedOn,
    entries: exercises.map((e) => ({
      id: e.id,
      source: { kind: 'custom' },
      name: e.name,
      dose: { sets: e.sets, reps: e.reps, ...(e.note ? { note: e.note } : {}) },
      daysPerWeek: e.daysPerWeek,
    })),
  }
}

const weekdayIndex = (date: string): number =>
  Math.round((startOfDay(date, 12) - startOfDay(weekStartOf(date), 12)) / 86_400_000)

/** One day of a written plan. RECO only lightens it on a flare-up morning, and only when the PT allowed that. */
export function planDay(plan: RecoveryPlan, date: string, status: Status | 'planned', marks: readonly PlanMark[]): ScheduledDay {
  const offset = weekdayIndex(date)
  const lighter = status === 'ease-off' && plan.adaptation === 'lighter-on-flare'
  const entries = plan.entries
    .filter((e) => scheduledWeekdays(e.daysPerWeek).includes(offset))
    .map((entry): ScheduledEntry => ({
      entry,
      dose: lighter ? entry.lightDose ?? entry.dose : entry.dose,
      lighter: lighter && entry.lightDose !== undefined,
      done: marks.some((m) => m.date === date && m.itemId === entry.id && m.done),
    }))
  return { date, entries, rest: entries.length === 0, allDone: entries.length > 0 && entries.every((e) => e.done) }
}

/** The plan's week (Monday first) around a date. */
export function planWeek(plan: RecoveryPlan, today: string, status: Status, marks: readonly PlanMark[]): readonly ScheduledDay[] {
  const start = weekStartOf(today)
  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
    const date = addDays(start, i)
    return planDay(plan, date, date === today ? status : 'planned', marks)
  })
}
