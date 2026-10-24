import { ROM_TARGETS } from './constants'
import type { RomDay } from './types'

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x))

/** 0..1 for extension: 1 when fully straight. */
export const extensionProgress = (deficitDeg: number): number =>
  clamp01(1 - deficitDeg / ROM_TARGETS.startDeficitDeg)

/** 0..1 for flexion between the start and full-flexion targets. */
export const flexionProgress = (flexionDeg: number): number =>
  clamp01((flexionDeg - ROM_TARGETS.startFlexionDeg) / (ROM_TARGETS.fullFlexionDeg - ROM_TARGETS.startFlexionDeg))

/** 0..1 for where the athlete is on a typical comeback timeline. */
export const timelineProgress = (weeksSinceInjury: number): number =>
  clamp01(weeksSinceInjury / ROM_TARGETS.comebackWeeks)

/**
 * Overall progress 0..100: straightening and bending from the latest tape day,
 * plus time on a typical comeback timeline so the bar never reads "done" at
 * week 8 just because range is back. Weights in ROM_TARGETS.
 */
export function progressPercent(latest: RomDay | undefined, weeksSinceInjury: number): number {
  const w = ROM_TARGETS.progressWeights
  const rom = latest
    ? w.extension * extensionProgress(latest.extensionDeficitDeg) + w.flexion * flexionProgress(latest.flexionDeg)
    : 0
  return Math.round(100 * (rom + w.timeline * timelineProgress(weeksSinceInjury)))
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
