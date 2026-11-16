import type { ClinicFlag } from '@reco/core'

import { copy } from '../copy'
import { relativeDay } from '../format'
import { SeverityMark } from './severity'

/** One flag with its proof: the tier as a word and a shape, what happened, where and when it came from. */
export function FlagCard({ flag, today }: { readonly flag: ClinicFlag; readonly today: string }) {
  return (
    <div className={`flag flag-${flag.tier}`} role={flag.tier === 'contact-soon' ? 'alert' : undefined}>
      <SeverityMark tier={flag.tier} />
      <p>
        <span className="flag-tier">{`${copy.tier[flag.tier]} · `}</span>
        <span className="flag-title">{flag.title}</span>
      </p>
      <p className="flag-proof">{flag.detail}</p>
      <p className="flag-meta">{`${relativeDay(flag.date, today)} · ${copy.source[flag.source]}`}</p>
    </div>
  )
}

export function FlagList({ flags, today }: { readonly flags: readonly ClinicFlag[]; readonly today: string }) {
  return (
    <section className="panel" aria-labelledby="flags-title">
      <h2 id="flags-title">{copy.flagsTitle}</h2>
      {flags.length === 0 ? (
        <p className="muted">{copy.noFlags}</p>
      ) : (
        <div className="stack">
          {flags.map((f) => (
            <FlagCard key={f.id} flag={f} today={today} />
          ))}
        </div>
      )}
    </section>
  )
}
