/** Drawn icons, one stroke weight, sized to the text beside them. */
export function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M9 3 L5 7 L9 11" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 7.5 L6 10.5 L11 4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Waiting, drawn as the O in RECO: a faint ring with a three-quarter arc that turns. */
export function LoadingRing() {
  return (
    <svg className="loading-ring" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--track)" strokeWidth="2" />
      <path d="M8 2 A6 6 0 1 1 2 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
