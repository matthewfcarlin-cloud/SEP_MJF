import { addDays, doseText, planDay, planFromTyped, resolvePlan } from '@reco/core'
import type { PlanDayView, RecoveryPlan } from '@reco/core'

import { useStore } from './provider'

export type PlanRow = PlanDayView['rows'][number]
export type PlanDayModel = PlanDayView

export interface PlanModel {
  /** pt: written by their PT on the clinic site. typed: typed in from their PT. guided: RECO's, at Guided only. none: no plan. */
  readonly kind: 'pt' | 'typed' | 'guided' | 'none'
  readonly plan: RecoveryPlan | undefined
  readonly empty: boolean
  readonly today: PlanDayModel
  readonly tomorrow: PlanDayModel | undefined
  readonly week: readonly PlanDayModel[]
  readonly done: number
  readonly planned: number
  /** Today shows lighter doses because of a flare-up morning (only when the PT allowed it). */
  readonly lighterToday: boolean
}

const KIND = { pt: 'pt', typed: 'typed', reco: 'guided', none: 'none' } as const

/** One shape for every plan source, from the shared resolver in core, so the screens only draw it once. */
export function usePlan(): PlanModel {
  const { state, today, view } = useStore()
  const r = resolvePlan({ data: state.data, guidance: state.guidance, reco: view.plan, today, status: view.status.status })
  const written = r.source === 'pt' ? state.data.ptPlan : r.source === 'typed' ? planFromTyped(state.data.exercises ?? [], today) : undefined
  const next = written ? planDay(written, addDays(today, 1), 'planned', state.data.planMarks ?? []) : undefined
  const tomorrow = next
    ? { date: next.date, rows: next.entries.map((e) => ({ id: e.entry.id, name: e.entry.name, detail: doseText(e.dose), done: e.done, lighter: false })), rest: next.rest, allDone: next.allDone }
    : undefined
  return {
    kind: KIND[r.source],
    plan: r.plan,
    empty: r.empty,
    today: r.today,
    tomorrow,
    week: r.week,
    done: r.done,
    planned: r.planned,
    lighterToday: r.source === 'pt' && r.today.rows.some((row) => row.lighter),
  }
}
