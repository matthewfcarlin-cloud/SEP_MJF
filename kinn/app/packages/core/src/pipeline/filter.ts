import type { Calibration, KneeSample } from '../domain/types'

export const MEDIAN_WINDOW = 5
const MAX_ANGLE_DEG = 160
const MIN_ANGLE_DEG = -20

/** Apply the calibration offset and sign, then clamp to a physical range. */
export function applyCalibration(sample: KneeSample, cal: Calibration): KneeSample {
  const signed = cal.signFlipped ? -sample.angleDeg : sample.angleDeg
  const angle = Math.max(MIN_ANGLE_DEG, Math.min(MAX_ANGLE_DEG, signed - cal.zeroOffsetDeg))
  return { ...sample, angleDeg: angle }
}

export type MedianWindow = readonly number[]

export function medianOf(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

/** Returns the next window and the filtered angle. The window is never mutated. */
export function medianFilterStep(window: MedianWindow, angleDeg: number): { window: MedianWindow; angleDeg: number } {
  const next = [...window, angleDeg].slice(-MEDIAN_WINDOW)
  return { window: next, angleDeg: medianOf(next) }
}
