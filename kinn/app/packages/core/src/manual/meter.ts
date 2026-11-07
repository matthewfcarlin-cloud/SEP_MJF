/**
 * Whether the recovery meter may show. It answers "am I getting better?", so it stays hidden
 * until a real range exists and fades when that range goes old, rather than implying a precision
 * the numbers behind it do not have.
 */
import { addDays } from '../time/day'
import type { Dataset, RomDay } from './types'

export const METER_RULES = { minLoggedDays: 3, staleAfterDays: 21 } as const

export type MeterState =
  | { readonly kind: 'building'; readonly hasRange: boolean; readonly loggedDays: number; readonly daysNeeded: number }
  | { readonly kind: 'normal' | 'stale'; readonly percent: number; readonly lastMeasured: RomDay }

/** Every date with any record of the person's, oldest first. A pain tap with no rating still counts. */
export function loggedDays(data: Pick<Dataset, 'activityLogs' | 'painLogs' | 'checkIns'>): readonly string[] {
  const dates = [...data.activityLogs.map((l) => l.date), ...data.painLogs.map((p) => p.date), ...data.checkIns.map((c) => c.date)]
  return [...new Set(dates)].sort()
}

export function meterFor(percent: number, romDays: readonly RomDay[], logged: number, today: string): MeterState {
  const lastMeasured = [...romDays].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
  if (!lastMeasured || logged < METER_RULES.minLoggedDays) {
    return { kind: 'building', hasRange: lastMeasured !== undefined, loggedDays: logged, daysNeeded: METER_RULES.minLoggedDays }
  }
  const stale = lastMeasured.date < addDays(today, -METER_RULES.staleAfterDays)
  return { kind: stale ? 'stale' : 'normal', percent, lastMeasured }
}
