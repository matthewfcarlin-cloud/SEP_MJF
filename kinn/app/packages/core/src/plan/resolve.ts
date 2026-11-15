/**
 * Which plan a patient follows today, and that day in one shape for both apps. In order: the plan
 * their PT wrote, the plan they typed in from their PT, RECO's protocol plan at the Guided level
 * only, otherwise none (the app shows their phase and how to find a PT).
 */
import type { GuidanceLevel } from '../guidance/read'
import type { Dataset, Status } from '../manual/types'
import type { DayPlan, PlanView } from './build'
import { doseText, planFromTyped, planWeek } from './recovery'
import type { RecoveryPlan, ScheduledDay } from './recovery'

export type PlanSource = 'pt' | 'typed' | 'reco' | 'none'

export interface PlanRow {
  readonly id: string
  readonly name: string
  readonly detail: string
  readonly done: boolean
  /** Showing the lighter dose because of a flare-up morning. */
  readonly lighter: boolean
}

export interface PlanDayView {
  readonly date: string
  readonly rows: readonly PlanRow[]
  readonly rest: boolean
  readonly allDone: boolean
}

export interface ResolvedPlan {
  readonly source: PlanSource
  /** The written plan, for a PT or typed source. */
  readonly plan: RecoveryPlan | undefined
  /** True when the patient has a PT but no plan is in yet. */
  readonly empty: boolean
  readonly today: PlanDayView
  readonly week: readonly PlanDayView[]
  readonly done: number
  readonly planned: number
}

interface ResolveInput {
  readonly data: Dataset
  readonly guidance: GuidanceLevel
  /** RECO's derived plan (TodayView.plan). */
  readonly reco: PlanView
  readonly today: string
  readonly status: Status
}

const fromScheduled = (d: ScheduledDay): PlanDayView => ({
  date: d.date,
  rows: d.entries.map((e) => ({ id: e.entry.id, name: e.entry.name, detail: doseText(e.dose), done: e.done, lighter: e.lighter })),
  rest: d.rest,
  allDone: d.allDone,
})

const fromReco = (d: DayPlan): PlanDayView => ({
  date: d.date,
  rows: d.items.map((i) => ({ id: i.id, name: i.exercise.name, detail: i.dose, done: i.done, lighter: i.dose !== i.exercise.dose })),
  rest: d.rest,
  allDone: d.items.length > 0 && d.items.every((i) => i.done),
})

function written(plan: RecoveryPlan, source: 'pt' | 'typed', input: ResolveInput): ResolvedPlan {
  const week = planWeek(plan, input.today, input.status, input.data.planMarks ?? []).map(fromScheduled)
  const upToToday = week.filter((d) => d.date <= input.today)
  return {
    source,
    plan,
    empty: plan.entries.length === 0,
    today: week.find((d) => d.date === input.today) ?? { date: input.today, rows: [], rest: true, allDone: false },
    week,
    done: upToToday.reduce((n, d) => n + d.rows.filter((r) => r.done).length, 0),
    planned: upToToday.reduce((n, d) => n + d.rows.length, 0),
  }
}

export function resolvePlan(input: ResolveInput): ResolvedPlan {
  const { data, guidance, reco, today } = input
  if (data.ptPlan) return written(data.ptPlan, 'pt', input)
  const typed = data.exercises ?? []
  if (typed.length > 0 || data.profile.hasPt) return written(planFromTyped(typed, today), 'typed', input)
  if (guidance === 'guided') {
    const week = reco.week.map(fromReco)
    return { source: 'reco', plan: undefined, empty: false, today: fromReco(reco.today), week, done: reco.doneThisWeek, planned: reco.plannedThisWeek }
  }
  const restDay = (date: string): PlanDayView => ({ date, rows: [], rest: true, allDone: false })
  return { source: 'none', plan: undefined, empty: true, today: restDay(today), week: reco.week.map((d) => restDay(d.date)), done: 0, planned: 0 }
}
