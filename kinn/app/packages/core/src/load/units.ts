import type { BendCycle, Component } from '../domain/types'
import {
  BASE_UNITS,
  DEEP_FLEXION_UNITS_PER_MS,
  IMPACT,
  OVER_RANGE_UNITS,
  SESSION_MULTIPLIER,
} from './constants'

export interface UnitPart {
  readonly component: Component
  readonly units: number
}

export interface CycleUnits {
  readonly total: number
  readonly parts: readonly UnitPart[]
}

const isImpact = (peakAccelG: number): boolean => peakAccelG >= IMPACT.thresholdG

const impactUnits = (peakAccelG: number): number =>
  Math.max(IMPACT.minUnits, IMPACT.perG * (peakAccelG - IMPACT.baselineG))

/**
 * Knee work units earned by one bend cycle, split into breakdown components.
 * Base and impact units are attributed to the movement class, or to the tagged
 * session when the cycle happened inside one (and multiplied). Deep-flexion time
 * and over-range excursions are their own components and are never multiplied.
 */
export function unitsForCycle(cycle: BendCycle): CycleUnits {
  const base = BASE_UNITS[cycle.activity]
  const impact = isImpact(cycle.peakAccelG) ? impactUnits(cycle.peakAccelG) : 0
  const multiplier = cycle.sessionKind ? SESSION_MULTIPLIER : 1
  const movementUnits = (base + impact) * multiplier
  const movementComponent: Component =
    cycle.sessionKind ?? (isImpact(cycle.peakAccelG) ? 'impact' : cycle.activity)

  const parts: UnitPart[] = [{ component: movementComponent, units: movementUnits }]

  if (cycle.deepFlexionMs > 0) {
    parts.push({ component: 'deepFlexion', units: cycle.deepFlexionMs * DEEP_FLEXION_UNITS_PER_MS })
  }
  if (cycle.overRange) {
    parts.push({ component: 'overRange', units: OVER_RANGE_UNITS })
  }

  const total = parts.reduce((sum, p) => sum + p.units, 0)
  return { total, parts }
}
