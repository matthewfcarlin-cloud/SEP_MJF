/**
 * Bend-limit check for a live knee angle. The tape's capacitive sensor tracks bend; its LIVE
 * stream gives the filtered raw value at 20 Hz. bendAngle turns that into degrees from two
 * points: the rest calibration (leg straight, 0°) and the max calibration (a bend the person
 * or PT enters). Above the max point the line is extended, so the max can be calibrated under
 * the limit and still catch bends past it. stepBendWatch turns readings into alerts.
 */
import type { BendAlert, BendCalibration } from '../manual/types'
import { dayKey } from '../time/day'
import type { PathView } from './progress'

export interface BendReading {
  /** Epoch ms. */
  readonly t: number
  readonly angleDeg: number
  /** True while the leg is taking weight (squat, step-up), where the loaded limit applies. */
  readonly loaded: boolean
}

/** The limit that applies to this reading, or null when nothing limits it. */
export function limitFor(reading: Pick<BendReading, 'loaded'>, limits: PathView['limits']): number | null {
  const caps = [limits.flexionMaxDeg, reading.loaded ? limits.loadedFlexionMaxDeg : null].filter((x): x is number => x !== null)
  return caps.length ? Math.min(...caps) : null
}

export function bendOverLimit(reading: BendReading, limits: PathView['limits']): BendAlert | null {
  const limitDeg = limitFor(reading, limits)
  if (limitDeg === null || reading.angleDeg <= limitDeg) return null
  return { date: dayKey(reading.t), t: reading.t, angleDeg: Math.round(reading.angleDeg), limitDeg, loaded: reading.loaded }
}

export const bendAlertsOn = (alerts: readonly BendAlert[], date: string): number => alerts.filter((a) => a.date === date).length

/** Calibration points as the tape reports them in STATUS. */
export interface TapeRawCalibration {
  readonly restRaw: number
  readonly maxRaw: number
}

/** Smallest raw span between rest and max that gives a usable angle (firmware rejects under 100). */
export const MIN_RAW_SPAN = 100

/**
 * Degrees from a raw reading, or null when the tape is uncalibrated. Assumes the sensor is close
 * to linear between straight and the max point: check against a goniometer before trusting it.
 */
export function bendAngle(raw: number, tape: TapeRawCalibration, cal: BendCalibration): number | null {
  const span = tape.maxRaw - tape.restRaw
  if (span < MIN_RAW_SPAN || cal.maxDeg <= 0) return null
  return Math.max(0, ((raw - tape.restRaw) / span) * cal.maxDeg)
}

export const BEND_WATCH = {
  /** A bend must stay over the limit this long to count, so a twitch or a noisy sample doesn't. */
  minOverMs: 300,
  /** After an alert, the knee has to come back this far under the limit before the next one. */
  resetBelowDeg: 3,
} as const

export interface BendWatchState {
  readonly overSinceMs: number | null
  readonly fired: boolean
}

export const BEND_WATCH_IDLE: BendWatchState = { overSinceMs: null, fired: false }

export interface WatchedReading extends BendReading {
  /** Device uptime, for timing how long a bend stays over the limit. */
  readonly uptimeMs: number
}

/** One live reading in, the next watch state and at most one alert out. One alert per excursion. */
export function stepBendWatch(state: BendWatchState, reading: WatchedReading, limits: PathView['limits']): { readonly state: BendWatchState; readonly alert: BendAlert | null } {
  const limit = limitFor(reading, limits)
  if (limit === null) return { state: BEND_WATCH_IDLE, alert: null }
  if (reading.angleDeg <= limit) {
    const settled = !state.fired || reading.angleDeg < limit - BEND_WATCH.resetBelowDeg
    return { state: settled ? BEND_WATCH_IDLE : { overSinceMs: null, fired: true }, alert: null }
  }
  const overSinceMs = state.overSinceMs ?? reading.uptimeMs
  if (state.fired || reading.uptimeMs - overSinceMs < BEND_WATCH.minOverMs) return { state: { overSinceMs, fired: state.fired }, alert: null }
  return { state: { overSinceMs, fired: true }, alert: bendOverLimit(reading, limits) }
}
