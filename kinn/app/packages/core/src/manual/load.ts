import { scoreFromUnits } from '../load/score'
import { MANUAL_UNITS } from './constants'
import type { ActivityLog, DayLoad } from './types'

export const unitsForLog = (log: ActivityLog): number => MANUAL_UNITS[log.activity][log.intensity]

/** Load for one day from its logs. A day with no logs scores 0. */
export function dayLoad(date: string, logs: readonly ActivityLog[]): DayLoad {
  const units = logs.filter((l) => l.date === date).reduce((sum, l) => sum + unitsForLog(l), 0)
  return { date, units, score: scoreFromUnits(units) }
}

/** Loads for each date key in order. */
export function loadsFor(dates: readonly string[], logs: readonly ActivityLog[]): readonly DayLoad[] {
  return dates.map((d) => dayLoad(d, logs))
}

const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length

/** Mean score over the given loads, ignoring days with no logs. */
export function baselineScore(loads: readonly DayLoad[]): number {
  return mean(loads.filter((l) => l.units > 0).map((l) => l.score))
}
