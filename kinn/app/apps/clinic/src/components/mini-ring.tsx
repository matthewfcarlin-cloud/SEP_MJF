import { RING_DAYS } from '@reco/core'
import type { MorningMark, WeekRing } from '@reco/core'

import { arcPath } from './polar'

const SIZE = 44
const C = SIZE / 2
const R = 17
const GAP_DEG = 6
const SEGMENT = 360 / RING_DAYS

const STROKE: Readonly<Record<MorningMark, string>> = { clear: 'var(--live)', some: 'var(--amber)', flare: 'var(--red)', none: 'var(--r8)' }

/** The week in the caseload: seven day segments from 12 o'clock, each the colour of that morning. */
export function MiniRing({ ring, label }: { readonly ring: WeekRing; readonly label: string }) {
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label}>
      {ring.days.map((d, i) => (
        <path key={d.date} d={arcPath(C, C, R, i * SEGMENT + GAP_DEG / 2, (i + 1) * SEGMENT - GAP_DEG / 2)} stroke={STROKE[d.morning]} strokeWidth={5} strokeLinecap="round" fill="none" />
      ))}
    </svg>
  )
}
