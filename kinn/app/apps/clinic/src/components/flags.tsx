import type { ClinicFlag, FlagTier } from '@reco/core'

import { copy } from '../copy'
import { relativeDay } from '../format'

/** The tier as a small chip, for the patient list. */
export function FlagChip({ tier, label }: { readonly tier: FlagTier; readonly label: string }) {
  return <span className={`chip chip-${tier}`}>{label}</span>
}

/** One flag in full: tier, what happened, and where and when it came from. */
export function FlagCard({ flag, today }: { readonly flag: ClinicFlag; readonly today: string }) {
  return (
    <div className={`flag flag-${flag.tier}`} role={flag.tier === 'contact-soon' ? 'alert' : undefined}>
      <div className="flag-head">
        <span className="flag-tier">{copy.tier[flag.tier]}</span>
        <span className="flag-title">{flag.title}</span>
      </div>
      <p className="flag-detail">{flag.detail}</p>
      <p className="flag-meta">{`${relativeDay(flag.date, today)} · ${copy.source[flag.source]}`}</p>
    </div>
  )
}

export function FlagList({ flags, today }: { readonly flags: readonly ClinicFlag[]; readonly today: string }) {
  if (flags.length === 0) return <p className="muted">{copy.noFlags}</p>
  return (
    <div className="stack-sm">
      {flags.map((f) => (
        <FlagCard key={f.id} flag={f} today={today} />
      ))}
    </div>
  )
}
