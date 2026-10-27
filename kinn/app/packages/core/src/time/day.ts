import { ACTIVE_DAY, DAY_BOUNDARY_HOUR } from '../load/constants'

const HOUR_MS = 3600_000

const pad = (n: number): string => String(n).padStart(2, '0')

/** Local calendar date for an epoch ms. */
export function localDateKey(t: number): string {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** The RECO day key: local date after shifting the 04:00 boundary back to midnight. */
export function dayKey(t: number): string {
  return localDateKey(t - DAY_BOUNDARY_HOUR * HOUR_MS)
}

/** Local hour of day as a fraction, e.g. 14.5 for 14:30. */
export function hourOf(t: number): number {
  const d = new Date(t)
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
}

/** Minutes of the 07:00..22:00 active window elapsed at time t. */
export function elapsedActiveMinutes(t: number): number {
  const h = hourOf(t)
  const start = ACTIVE_DAY.startHour
  const end = ACTIVE_DAY.endHour
  return Math.round(Math.max(0, Math.min(end, h) - start) * 60)
}

/** 0..1: minutes with sensor data over the active minutes elapsed. 1 when nothing has elapsed. */
export function wearCoverage(wornMinutes: number, t: number): number {
  const elapsed = elapsedActiveMinutes(t)
  if (elapsed <= 0) return 1
  return Math.max(0, Math.min(1, wornMinutes / elapsed))
}

/** Epoch ms for a local date key at a given hour (default 04:00, the day boundary). */
export function startOfDay(dateKey: string, hour: number = DAY_BOUNDARY_HOUR): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, hour, 0, 0, 0).getTime()
}

export function addDays(dateKey: string, days: number): string {
  const t = startOfDay(dateKey, 12) + days * 24 * HOUR_MS
  return localDateKey(t)
}

/** Whole weeks between a surgery date (YYYY-MM-DD) and now, fractional. */
export function weeksSince(surgeryDate: string, now: number): number {
  const start = startOfDay(surgeryDate, 12)
  return (now - start) / (7 * 24 * HOUR_MS)
}
