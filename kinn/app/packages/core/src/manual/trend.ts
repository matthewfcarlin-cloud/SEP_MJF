import { ROM_TARGETS } from './constants'
import { addDays } from '../time/day'
import type { DayLoad, RomDay } from './types'

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x))

/** 0..1 for extension: 1 when fully straight. */
export const extensionProgress = (deficitDeg: number): number =>
  clamp01(1 - deficitDeg / ROM_TARGETS.startDeficitDeg)

/** 0..1 for flexion between the start and full-flexion targets. */
export const flexionProgress = (flexionDeg: number): number =>
  clamp01((flexionDeg - ROM_TARGETS.startFlexionDeg) / (ROM_TARGETS.fullFlexionDeg - ROM_TARGETS.startFlexionDeg))

/**
 * 0..1 for capacity: the mean load over the last week's logged days, counting a
 * day only if the next morning was not a flare-up. Rises with work you handled
 * and dips after a flare-up, whatever the calendar says.
 */
export function capacityProgress(loads: readonly DayLoad[], flareDates: ReadonlySet<string>, today: string): number {
  const window = loads.filter((l) => l.date < today && l.units > 0).slice(-ROM_TARGETS.capacityWindowDays)
  if (window.length === 0) return 0
  const tolerated = window.map((l) => (flareDates.has(addDays(l.date, 1)) ? 0 : l.score))
  const mean = tolerated.reduce((s, x) => s + x, 0) / window.length
  return clamp01(mean / ROM_TARGETS.capacityTargetScore)
}

/**
 * Overall progress 0..100. With tape range of motion: straightening, bending and
 * capacity. Without (shoulder, elbow, or no tape yet): capacity alone.
 */
export function progressPercent(latest: RomDay | undefined, capacity: number): number {
  const w = ROM_TARGETS.progressWeights
  if (!latest) return Math.round(100 * clamp01(capacity))
  const rom = w.extension * extensionProgress(latest.extensionDeficitDeg) + w.flexion * flexionProgress(latest.flexionDeg)
  return Math.round(100 * (rom + w.capacity * clamp01(capacity)))
}

export type ProgressReason = 'range' | 'capacity' | 'flare' | 'flat'

export interface ProgressChange {
  readonly delta: number
  readonly reason: ProgressReason
}

/** Why the meter moved over the last week, for the one line under the dial on Progress. */
export function progressChange(now: number, weekAgo: number, romGain: number, flaresThisWeek: number): ProgressChange {
  const delta = now - weekAgo
  if (delta < 0 && flaresThisWeek > 0) return { delta, reason: 'flare' }
  if (Math.abs(delta) < 1) return { delta: 0, reason: 'flat' }
  return { delta, reason: romGain > 0 ? 'range' : 'capacity' }
}

export type MilestoneKind = 'full-straightening' | 'bike-range' | 'full-bend'

export interface Milestone {
  readonly kind: MilestoneKind
  readonly date: string
  readonly label: string
}

const LABELS: Record<MilestoneKind, string> = {
  'full-straightening': 'Full straightening reached',
  'bike-range': 'Bike range reached (120°)',
  'full-bend': 'Full bend reached (135°)',
}

const reached: Record<MilestoneKind, (d: RomDay) => boolean> = {
  'full-straightening': (d) => d.extensionDeficitDeg <= ROM_TARGETS.straightDeg,
  'bike-range': (d) => d.flexionDeg >= ROM_TARGETS.bikeFlexionDeg,
  'full-bend': (d) => d.flexionDeg >= ROM_TARGETS.fullFlexionDeg,
}

/** The first day each milestone was reached, in date order. */
export function milestones(days: readonly RomDay[]): readonly Milestone[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const kinds = Object.keys(reached) as MilestoneKind[]
  return kinds
    .map((kind) => {
      const first = sorted.find(reached[kind])
      return first ? { kind, date: first.date, label: LABELS[kind] } : undefined
    })
    .filter((m): m is Milestone => m !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
}
