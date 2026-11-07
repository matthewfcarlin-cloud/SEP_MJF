/**
 * The plan a person types in from their PT. RECO only keeps count: it spreads the days evenly
 * across the week and never judges a day that was not done. There is no "missed" state.
 */
import { addDays, startOfDay } from '../time/day'
import type { PlanExercise, PlanMark } from '../manual/types'

const DAYS_IN_WEEK = 7

export interface TypedPlanItem {
  readonly id: string
  readonly name: string
  readonly detail: string
  readonly daysPerWeek: number
  readonly done: boolean
}

export interface TypedPlanDay {
  readonly date: string
  readonly items: readonly TypedPlanItem[]
  readonly rest: boolean
  readonly allDone: boolean
}

export interface TypedPlan {
  readonly today: TypedPlanDay
  readonly tomorrow: TypedPlanDay
  readonly week: readonly TypedPlanDay[]
  readonly doneThisWeek: number
  readonly plannedThisWeek: number
}

/** The Monday of the week holding this date. */
export function weekStartOf(date: string): string {
  const weekday = new Date(startOfDay(date, 12)).getDay()
  return addDays(date, -((weekday + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK))
}

/** Days of the week (0 = Monday) an exercise falls on, spread as evenly as whole days allow. */
export function scheduledWeekdays(daysPerWeek: number): readonly number[] {
  const n = Math.max(1, Math.min(DAYS_IN_WEEK, Math.round(daysPerWeek)))
  return Array.from({ length: n }, (_, i) => Math.floor((i * DAYS_IN_WEEK) / n))
}

export const exerciseDetail = (e: Pick<PlanExercise, 'sets' | 'reps'>): string => `${e.sets} sets of ${e.reps}`

function dayFor(date: string, exercises: readonly PlanExercise[], marks: readonly PlanMark[]): TypedPlanDay {
  const offset = Math.round((startOfDay(date, 12) - startOfDay(weekStartOf(date), 12)) / 86_400_000)
  const items = exercises
    .filter((e) => scheduledWeekdays(e.daysPerWeek).includes(offset))
    .map((e) => ({
      id: e.id,
      name: e.name,
      detail: exerciseDetail(e),
      daysPerWeek: e.daysPerWeek,
      done: marks.some((m) => m.date === date && m.itemId === e.id && m.done),
    }))
  return { date, items, rest: items.length === 0, allDone: items.length > 0 && items.every((i) => i.done) }
}

export function typedPlan(exercises: readonly PlanExercise[], marks: readonly PlanMark[], today: string): TypedPlan {
  const start = weekStartOf(today)
  const week = Array.from({ length: DAYS_IN_WEEK }, (_, i) => dayFor(addDays(start, i), exercises, marks))
  const items = week.flatMap((d) => d.items)
  return {
    today: dayFor(today, exercises, marks),
    tomorrow: dayFor(addDays(today, 1), exercises, marks),
    week,
    doneThisWeek: items.filter((i) => i.done).length,
    plannedThisWeek: items.length,
  }
}
