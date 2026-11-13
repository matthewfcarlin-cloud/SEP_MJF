import type { PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { FlagList } from './flags'
import { NextStepsSection } from './next-steps'
import { ProgressSection } from './progress'
import { WeekSection } from './week'

/** One patient: flags first (so nothing alarming sits below the fold), then progress, next steps and the week. */
export function PatientDetail({ patient, today }: { readonly patient: PatientSummary; readonly today: string }) {
  return (
    <article className="detail" aria-labelledby="patient-name">
      <header className="detail-head">
        <h2 id="patient-name">{patient.name}</h2>
        <span className="muted">{`${patient.surgeryLabel} · week ${Math.floor(patient.weeksIn)} · ${patient.sport}`}</span>
      </header>
      <section className="stack-sm" aria-labelledby="flags-title">
        <h3 id="flags-title" className="label">{copy.flagsTitle}</h3>
        <FlagList flags={patient.flags} today={today} />
      </section>
      <div className="detail-grid">
        <ProgressSection patient={patient} today={today} />
        <NextStepsSection patient={patient} />
      </div>
      <WeekSection patient={patient} today={today} />
    </article>
  )
}
