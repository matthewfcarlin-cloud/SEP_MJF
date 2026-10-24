import type { Band, Call, Swelling } from '../domain/types'
import { ACTIVE_DAY, CALL_RULES } from './constants'

export interface CallInput {
  readonly scoreSoFar: number
  readonly projected: number
  readonly band: Band | undefined
  readonly excursionsToday: number
  readonly maxPainToday: number | undefined
  readonly lastNightSwelling: Swelling | undefined
  readonly flareUpInLast24h: boolean
  /** 0..1 of the elapsed active day with sensor data. */
  readonly wearCoverage: number
  readonly elapsedActiveMinutes: number
}

const hasEnoughData = (input: CallInput): boolean =>
  input.elapsedActiveMinutes < CALL_RULES.minElapsedMinutesForCoverage ||
  input.wearCoverage >= CALL_RULES.minCoverage

const bandCall = (projected: number, band: Band): Call => {
  if (projected < band.lower) return 'room-to-push'
  if (projected > band.upper) return 'ease-off'
  return 'on-target'
}

const forcesEaseOff = (input: CallInput): boolean =>
  input.excursionsToday >= CALL_RULES.easeOffExcursions ||
  (input.maxPainToday ?? -1) >= CALL_RULES.easeOffPain ||
  input.lastNightSwelling === 'a-lot'

/** The headline call. Order: data sufficiency, band position, then the overrides. */
export function evaluateCall(input: CallInput): Call {
  if (!hasEnoughData(input)) return 'not-enough-data'
  if (!input.band) return 'no-target'

  const base = bandCall(input.projected, input.band)
  if (forcesEaseOff(input)) return 'ease-off'
  if (base === 'room-to-push' && input.flareUpInLast24h) return 'on-target'
  return base
}

export interface DayProfile {
  readonly endOfDay: number
  /** Score reached at each hour 0..23. */
  readonly atHour: readonly number[]
}

export interface ProjectionInput {
  readonly scoreSoFar: number
  /** Local hour, fractional allowed. */
  readonly hour: number
  readonly history: readonly DayProfile[]
  readonly band: Band | undefined
}

const median = (xs: readonly number[]): number => {
  const sorted = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
}

/** Fraction of the active day (07:00..22:00) that has elapsed, 0..1. */
export function activeDayFraction(hour: number): number {
  const span = ACTIVE_DAY.endHour - ACTIVE_DAY.startHour
  return Math.max(0, Math.min(1, (hour - ACTIVE_DAY.startHour) / span))
}

const clampProjection = (value: number, scoreSoFar: number): number =>
  Math.round(Math.max(scoreSoFar, Math.min(100, value)))

/**
 * Expected end-of-day score. With history: so-far plus the median remainder seen
 * at this hour. Without history: the band centre early in the day, otherwise the
 * so-far score scaled by the fraction of the active day elapsed.
 */
export function projectEndOfDay(input: ProjectionInput): number {
  const fraction = activeDayFraction(input.hour)
  if (fraction >= 1) return input.scoreSoFar

  if (input.history.length > 0) {
    const h = Math.min(23, Math.max(0, Math.floor(input.hour)))
    const remainders = input.history.map((d) => Math.max(0, d.endOfDay - (d.atHour[h] ?? 0)))
    return clampProjection(input.scoreSoFar + median(remainders), input.scoreSoFar)
  }

  if (fraction < CALL_RULES.minDayFractionForProjection) {
    const centre = input.band ? (input.band.lower + input.band.upper) / 2 : input.scoreSoFar
    return clampProjection(centre, input.scoreSoFar)
  }
  return clampProjection(input.scoreSoFar / fraction, input.scoreSoFar)
}
