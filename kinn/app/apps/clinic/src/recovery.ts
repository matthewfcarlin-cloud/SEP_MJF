import type { PathView } from '@reco/core'

/**
 * How far along the protocol a patient is, from 0 to 1: the phases behind them, plus the share of
 * the current phase's checkpoints they have met. It places the bar; the words beside it say the phase.
 */
export function recoveryFraction(path: PathView): number {
  const total = path.protocol.phases.length
  if (total === 0) return 0
  if (path.state === 'complete') return 1
  const within = path.requiredCount > 0 ? path.metCount / path.requiredCount : 0
  return Math.max(0, Math.min(1, (path.phase.n - 1 + Math.min(1, within)) / total))
}
