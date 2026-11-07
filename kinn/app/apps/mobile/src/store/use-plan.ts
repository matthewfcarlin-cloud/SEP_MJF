import { typedPlan } from '@reco/core'

import { useStore } from './provider'

export interface PlanRow {
  readonly id: string
  readonly name: string
  readonly detail: string
  readonly done: boolean
}

export interface PlanDayModel {
  readonly date: string
  readonly rows: readonly PlanRow[]
  readonly rest: boolean
  readonly allDone: boolean
}

export interface PlanModel {
  /** typed: the PT's exercises. guided: generated, after review only. none: no PT and below Guided. */
  readonly kind: 'typed' | 'guided' | 'none'
  readonly empty: boolean
  readonly today: PlanDayModel
  readonly tomorrow: PlanDayModel | undefined
  readonly week: readonly PlanDayModel[]
  readonly done: number
  readonly planned: number
}

/** One shape for both plan sources, so the screens only draw it once. */
export function usePlan(): PlanModel {
  const { state, today, view } = useStore()
  const exercises = state.data.exercises ?? []
  if (state.guidance === 'guided') {
    const toDay = (d: (typeof view.plan.week)[number]): PlanDayModel => ({
      date: d.date,
      rows: d.items.map((i) => ({ id: i.id, name: i.exercise.name, detail: i.dose, done: i.done })),
      rest: d.rest,
      allDone: d.items.length > 0 && d.items.every((i) => i.done),
    })
    return { kind: 'guided', empty: false, today: toDay(view.plan.today), tomorrow: undefined, week: view.plan.week.map(toDay), done: view.plan.doneThisWeek, planned: view.plan.plannedThisWeek }
  }
  const plan = typedPlan(exercises, state.data.planMarks ?? [], today)
  const toDay = (d: (typeof plan.week)[number]): PlanDayModel => ({
    date: d.date,
    rows: d.items.map((i) => ({ id: i.id, name: i.name, detail: i.detail, done: i.done })),
    rest: d.rest,
    allDone: d.allDone,
  })
  return {
    kind: state.data.profile.hasPt || exercises.length > 0 ? 'typed' : 'none',
    empty: exercises.length === 0,
    today: toDay(plan.today),
    tomorrow: toDay(plan.tomorrow),
    week: plan.week.map(toDay),
    done: plan.doneThisWeek,
    planned: plan.plannedThisWeek,
  }
}
