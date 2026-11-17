import type { ClinicFlag } from '@reco/core'

import { copy } from '../copy'
import { relativeDay } from '../format'
import { StatusTag } from './status-tag'

/** One flag with its proof: the tier as a word, what happened, where and when it came from. */
export function FlagCard({ flag, today }: { readonly flag: ClinicFlag; readonly today: string }) {
  return (
    <div className={`alert alert-${flag.tier}`} role={flag.tier === 'contact-soon' ? 'alert' : undefined}>
      <p className="alert-title">
        <StatusTag tier={flag.tier} />
        <span>{flag.title}</span>
      </p>
      <p>{flag.detail}</p>
      <p className="small alert-meta">{`${relativeDay(flag.date, today)} · ${copy.source[flag.source]}`}</p>
    </div>
  )
}

export function FlagList({ flags, today }: { readonly flags: readonly ClinicFlag[]; readonly today: string }) {
  return (
    <section className="card" aria-labelledby="flags-title">
      <header className="card-head"><h2 id="flags-title">{copy.flagsTitle}</h2></header>
      <div className="card-body stack">
        {flags.length === 0 ? (
          <p className="muted">{copy.noFlags}</p>
        ) : (
          flags.map((f) => <FlagCard key={f.id} flag={f} today={today} />)
        )}
      </div>
    </section>
  )
}
