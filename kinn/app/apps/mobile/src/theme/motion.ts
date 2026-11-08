/**
 * RECO motion tokens, the same names as the "Motion — hero moments" page in Figma.
 * Keep every spring and timing here so the hero moments feel like one system.
 */
import { Easing } from 'react-native-reanimated'

/** Things coming to rest: cards, the ring after its pop. */
export const SETTLE = { damping: 18, stiffness: 180 } as const
/** Arrivals with a little overshoot: the status word, the ring landing. */
export const POP = { damping: 12, stiffness: 320 } as const

/** The ring drawing round to a value. A number inside the ring counts on this same timeline. */
export const SWEEP_MS = 900
export const SWEEP_EASING = Easing.out(Easing.cubic)
/** The same curve as SWEEP_EASING, for counting on the JS side: t in 0..1 to eased 0..1. */
export function sweepEase(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
/** Gap between items arriving one after another. */
export const STAGGER_MS = 60
/** Fades for text that follows a hero moment, and the Reduce Motion crossfade. */
export const FADE_MS = 220
