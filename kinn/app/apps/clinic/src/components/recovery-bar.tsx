import type { PathView } from '@reco/core'

import { copy } from '../copy'
import { recoveryFraction } from '../recovery'

/** Never quite empty: a patient in week one is on the protocol, and the bar should show it. */
const MIN_FILL_PERCENT = 4

/** The small bar beside each patient: where they are on their protocol, with the phase in words. */
export function RecoveryBar({ path }: { readonly path: PathView | undefined }) {
  if (!path) return <span className="muted small">{copy.noProtocolShort}</span>
  const total = path.protocol.phases.length
  const percent = Math.max(MIN_FILL_PERCENT, Math.round(recoveryFraction(path) * 100))
  const words = copy.rowPhase(path.phase.n, total)
  return (
    <span className="recovery">
      <span className="recovery-track" role="progressbar" aria-label={copy.recoveryLabel} aria-valuemin={0} aria-valuemax={total} aria-valuenow={path.phase.n} aria-valuetext={`${words}: ${path.phase.name}`}>
        <span className="recovery-fill" style={{ width: `${percent}%` }} />
      </span>
      <span className="recovery-text">{`${words} · ${path.phase.name}`}</span>
    </span>
  )
}
