import { useEffect, useState } from 'react'

import { SWEEP_MS, sweepEase } from '@/theme/motion'

interface CountUpOptions {
  /** When false the number is shown at its value straight away. */
  readonly enabled: boolean
  readonly delayMs?: number
  readonly durationMs?: number
}

/**
 * Counts a whole number up from 0 on the ring's timeline (same length and curve as the sweep),
 * so with the same delay the number always matches how far round the arc is.
 */
export function useCountUp(target: number, { enabled, delayMs = 0, durationMs = SWEEP_MS }: CountUpOptions): number {
  const [shown, setShown] = useState(0)
  // Counts once per mount. A later change of target (a new log) just shows the new value.
  const [isDone, setIsDone] = useState(!enabled)

  useEffect(() => {
    if (isDone) return
    let frame = 0
    const startAt = Date.now() + delayMs
    const step = () => {
      const t = Math.max(0, Math.min(1, (Date.now() - startAt) / durationMs))
      setShown(Math.round(target * sweepEase(t)))
      if (t < 1) frame = requestAnimationFrame(step)
      else setIsDone(true)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, isDone, delayMs, durationMs])

  return isDone ? target : shown
}
