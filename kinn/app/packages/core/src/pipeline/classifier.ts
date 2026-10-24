import type { Activity, BendCycle } from '../domain/types'
import { CLASSIFIER, IMPACT } from '../load/constants'

export type CycleDraft = Omit<BendCycle, 'activity' | 'sessionKind'>

/** Cycles per minute for this knee, from the start of the previous cycle. */
export function cycleRate(prevStartT: number | undefined, startT: number): number | undefined {
  if (prevStartT === undefined) return undefined
  const dt = startT - prevStartT
  if (dt <= 0) return undefined
  return 60_000 / dt
}

const within = (x: number, lo: number, hi: number): boolean => x >= lo && x <= hi

/**
 * Threshold classifier for v0. Rates are per knee per minute (half the step rate).
 * Order matters: impact is unmistakable; cycling and stairs overlap in angle and
 * are split by shin acceleration; walking is shallow and rhythmic; slow deep
 * cycles are bends.
 */
export function classifyCycle(cycle: CycleDraft, rate: number | undefined): Activity {
  const { peakDeg, peakAccelG } = cycle
  if (peakAccelG >= IMPACT.thresholdG) return 'impact'

  const c = CLASSIFIER
  if (rate !== undefined) {
    if (within(peakDeg, c.cycling.minPeakDeg, c.cycling.maxPeakDeg) && within(rate, c.cycling.minRate, c.cycling.maxRate) && peakAccelG < c.cycling.maxAccelG) {
      return 'cycling'
    }
    if (within(peakDeg, c.stairs.minPeakDeg, c.stairs.maxPeakDeg) && within(rate, c.stairs.minRate, c.stairs.maxRate) && peakAccelG >= c.stairs.minAccelG) {
      return 'stairs'
    }
    if (peakDeg <= c.walking.maxPeakDeg && within(rate, c.walking.minRate, c.walking.maxRate)) return 'walking'
    if (rate <= c.bend.maxRate && peakDeg > c.walking.maxPeakDeg) return 'bend'
    return 'unknown'
  }

  if (peakDeg <= c.walking.maxPeakDeg) return 'walking'
  if (peakDeg > c.walking.maxPeakDeg) return 'bend'
  return 'unknown'
}

/** Attach the session kind for cycles that fall inside a tagged session. */
export function withSession(cycle: BendCycle, sessions: readonly { kind: 'pt' | 'training'; startedAt: number; endedAt?: number }[]): BendCycle {
  const hit = sessions.find((s) => cycle.startT >= s.startedAt && cycle.startT <= (s.endedAt ?? Number.POSITIVE_INFINITY))
  return hit ? { ...cycle, sessionKind: hit.kind } : cycle
}
