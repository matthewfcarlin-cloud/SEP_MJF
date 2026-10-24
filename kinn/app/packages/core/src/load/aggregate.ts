import type { Band, BendCycle, DailyLoad, Swelling } from '../domain/types'
import { evaluateCall, projectEndOfDay } from './call'
import type { DayProfile } from './call'
import { CALL_RULES, MODEL_VERSION } from './constants'
import { reasonFor } from './reason'
import { scoreFromUnits, sumComponents, totalUnits } from './score'
import type { ComponentMap } from './score'
import { unitsForCycle } from './units'

export interface AggregateInput {
  readonly date: string
  readonly cycles: readonly BendCycle[]
  readonly excursionCount: number
  readonly band: Band | undefined
  readonly wearCoverage: number
  readonly elapsedActiveMinutes: number
  readonly hour: number
  readonly history: readonly DayProfile[]
  readonly maxPainToday?: number
  readonly lastNightSwelling?: Swelling
  readonly flareUpInLast24h: boolean
}

export function componentsFor(cycles: readonly BendCycle[]): ComponentMap {
  return cycles.reduce<ComponentMap>((acc, c) => sumComponents(acc, unitsForCycle(c).parts), {})
}

/** Build (or rebuild) one day's DailyLoad from its cycles. Pure. */
export function aggregateDay(input: AggregateInput): DailyLoad {
  const components = componentsFor(input.cycles)
  const rawUnits = totalUnits(components)
  const score = scoreFromUnits(rawUnits)
  const projected = projectEndOfDay({ scoreSoFar: score, hour: input.hour, history: input.history, band: input.band })
  const call = evaluateCall({
    scoreSoFar: score,
    projected,
    band: input.band,
    excursionsToday: input.excursionCount,
    maxPainToday: input.maxPainToday,
    lastNightSwelling: input.lastNightSwelling,
    flareUpInLast24h: input.flareUpInLast24h,
    wearCoverage: input.wearCoverage,
    elapsedActiveMinutes: input.elapsedActiveMinutes,
  })
  const partial = input.wearCoverage < CALL_RULES.minCoverage && input.elapsedActiveMinutes >= CALL_RULES.minElapsedMinutesForCoverage
  const reason = reasonFor({
    call,
    score,
    band: input.band,
    components,
    excursions: input.excursionCount,
    hour: input.hour,
    partial,
  })

  const base = {
    date: input.date,
    modelVersion: MODEL_VERSION,
    rawUnits,
    score,
    components,
    call,
    reason,
    wearCoverage: input.wearCoverage,
    partial,
    excursions: input.excursionCount,
  }
  return input.band ? { ...base, band: input.band } : base
}
