import type { FlagTier } from '@reco/core'

/**
 * The tier as a shape, so severity reads without colour: a filled diamond for contact soon,
 * a half-filled diamond for worth a look, an outline for a note.
 */
export function SeverityMark({ tier, size = 12 }: { readonly tier: FlagTier; readonly size?: number }) {
  const half = size / 2
  const d = `M ${half} 0.75 L ${size - 0.75} ${half} L ${half} ${size - 0.75} L 0.75 ${half} Z`
  return (
    <svg className={`sev sev-${tier}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {tier === 'worth-a-look' ? (
        <>
          <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} />
          <path d={`M ${half} 0.75 L ${size - 0.75} ${half} L ${half} ${size - 0.75} Z`} fill="currentColor" />
        </>
      ) : (
        <path d={d} fill={tier === 'contact-soon' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} />
      )}
    </svg>
  )
}
