import type { Component, ComponentTotal } from '../domain/types'
import { HEALTHY_DAY_UNITS } from './constants'
import type { UnitPart } from './units'

export type ComponentMap = Readonly<Partial<Record<Component, ComponentTotal>>>

/** Linear in units up to the healthy-day anchor, pinned at 100 above it. */
export function scoreFromUnits(rawUnits: number): number {
  const units = Math.max(0, rawUnits)
  return Math.min(100, Math.round((100 * units) / HEALTHY_DAY_UNITS))
}

/** Returns a new component map with the parts added. Each part counts once. */
export function sumComponents(current: ComponentMap, parts: readonly UnitPart[]): ComponentMap {
  return parts.reduce<ComponentMap>((acc, part) => {
    const prev = acc[part.component] ?? { units: 0, count: 0 }
    return { ...acc, [part.component]: { units: prev.units + part.units, count: prev.count + 1 } }
  }, current)
}

export function totalUnits(components: ComponentMap): number {
  return Object.values(components).reduce((sum, c) => sum + (c?.units ?? 0), 0)
}
