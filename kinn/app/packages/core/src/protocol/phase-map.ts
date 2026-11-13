/**
 * Protocol phases (6) to exercise-library phases (4). Written out as a table on purpose:
 * the two scales are not evenly spaced, so arithmetic would hide a clinical choice.
 */
import type { Phase } from '../plan/library'

export const LIBRARY_PHASE_FOR_PROTOCOL_PHASE: Readonly<Record<number, Phase>> = {
  1: 1, // Protect and straighten / Protect the repair → Protect and move
  2: 1, // Get your bend back / Calm it down → Protect and move
  3: 2, // Build strength / Walk normal → Build strength
  4: 3, // Bridge to sport → Build capacity
  5: 4, // Run, jump, train → Back to your activity
  6: 4, // Back to your sport → Back to your activity
}

export function libraryPhaseFor(protocolPhase: number): Phase {
  const phase = LIBRARY_PHASE_FOR_PROTOCOL_PHASE[protocolPhase]
  if (phase === undefined) throw new Error(`No library phase for protocol phase ${protocolPhase}`)
  return phase
}
