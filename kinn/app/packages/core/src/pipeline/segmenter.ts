import type { BendCycle, KneeSample } from '../domain/types'
import { MIN_CYCLE_EXCURSION_DEG, RANGE_ALERT } from '../load/constants'
import { classifyCycle, cycleRate } from './classifier'

/** The cycle closes once the angle has fallen this far back toward the trough. */
const CLOSE_FRACTION = 0.3

export interface SegmentThresholds {
  readonly deepThresholdDeg: number
  /** null = no range limit. */
  readonly limitDeg: number | null
}

export interface SegmenterState {
  readonly phase: 'idle' | 'inCycle'
  readonly troughDeg: number
  readonly troughT: number
  readonly peakDeg: number
  readonly peakAccelG: number
  readonly deepMs: number
  readonly aboveLimitMs: number
  readonly overRange: boolean
  readonly lastSample?: KneeSample
  readonly prevCycleStartT?: number
  readonly cycleCount: number
}

export const initialSegmenterState: SegmenterState = {
  phase: 'idle',
  troughDeg: Number.POSITIVE_INFINITY,
  troughT: 0,
  peakDeg: Number.NEGATIVE_INFINITY,
  peakAccelG: 0,
  deepMs: 0,
  aboveLimitMs: 0,
  overRange: false,
  cycleCount: 0,
}

export interface SegmentResult {
  readonly state: SegmenterState
  readonly cycle?: BendCycle
}

const idleFrom = (state: SegmenterState, sample: KneeSample, prevCycleStartT?: number): SegmenterState => {
  const prev = prevCycleStartT ?? state.prevCycleStartT
  const base: SegmenterState = {
    ...initialSegmenterState,
    troughDeg: sample.angleDeg,
    troughT: sample.t,
    lastSample: sample,
    cycleCount: state.cycleCount,
  }
  return prev === undefined ? base : { ...base, prevCycleStartT: prev }
}

function accumulate(state: SegmenterState, sample: KneeSample, dtMs: number, th: SegmentThresholds): SegmenterState {
  const deep = sample.angleDeg > th.deepThresholdDeg ? dtMs : 0
  const limit = th.limitDeg
  const above = limit !== null && sample.angleDeg > limit + RANGE_ALERT.marginDeg
  const aboveLimitMs = above ? state.aboveLimitMs + dtMs : 0
  return {
    ...state,
    peakDeg: Math.max(state.peakDeg, sample.angleDeg),
    peakAccelG: Math.max(state.peakAccelG, sample.shinAccelG),
    deepMs: state.deepMs + deep,
    aboveLimitMs,
    overRange: state.overRange || aboveLimitMs >= RANGE_ALERT.sustainMs,
    lastSample: sample,
  }
}

function closeCycle(state: SegmenterState, sample: KneeSample): BendCycle {
  const rate = cycleRate(state.prevCycleStartT, state.troughT)
  const draft = {
    id: `cyc-${state.troughT}`,
    startT: state.troughT,
    endT: sample.t,
    peakDeg: Math.round(state.peakDeg * 10) / 10,
    troughDeg: Math.round(state.troughDeg * 10) / 10,
    peakAccelG: Math.round(state.peakAccelG * 100) / 100,
    deepFlexionMs: Math.round(state.deepMs),
    overRange: state.overRange,
  }
  return { ...draft, activity: classifyCycle(draft, rate) }
}

/**
 * One step of the pure cycle segmenter. A cycle starts at a trough, is confirmed
 * once the angle rises MIN_CYCLE_EXCURSION_DEG above it, and closes when the
 * angle has fallen most of the way back. Returns the new state and, when a
 * cycle just closed, that cycle.
 */
export function segmentStep(state: SegmenterState, sample: KneeSample, th: SegmentThresholds): SegmentResult {
  if (!state.lastSample) return { state: idleFrom(state, sample) }
  const dtMs = Math.max(0, sample.t - state.lastSample.t)

  if (state.phase === 'idle') {
    // A foot strike lands at the trough, before the cycle is confirmed, so the
    // acceleration seen while idle belongs to the cycle about to start.
    const peakAccelG = Math.max(state.peakAccelG, sample.shinAccelG)
    if (sample.angleDeg <= state.troughDeg) {
      return { state: { ...state, troughDeg: sample.angleDeg, troughT: sample.t, peakAccelG, lastSample: sample } }
    }
    if (sample.angleDeg - state.troughDeg >= MIN_CYCLE_EXCURSION_DEG) {
      const started = accumulate({ ...state, phase: 'inCycle', peakDeg: state.troughDeg, peakAccelG }, sample, dtMs, th)
      return { state: started }
    }
    return { state: { ...state, peakAccelG, lastSample: sample } }
  }

  const next = accumulate(state, sample, dtMs, th)
  const closeAt = next.troughDeg + CLOSE_FRACTION * (next.peakDeg - next.troughDeg)
  if (sample.angleDeg <= closeAt) {
    const cycle = closeCycle(next, sample)
    const reset = idleFrom({ ...next, cycleCount: next.cycleCount + 1 }, sample, next.troughT)
    return { state: reset, cycle }
  }
  return { state: next }
}

/** Convenience for tests and the simulator: segment a whole sample array. */
export function segmentAll(samples: readonly KneeSample[], th: SegmentThresholds): BendCycle[] {
  const cycles: BendCycle[] = []
  let state = initialSegmenterState
  for (const s of samples) {
    const r = segmentStep(state, s, th)
    state = r.state
    if (r.cycle) cycles.push(r.cycle)
  }
  return cycles
}
