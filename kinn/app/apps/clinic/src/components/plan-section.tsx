import { doseText } from '@reco/core'
import type { PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { shortDate } from '../format'

/** The plan the patient follows from a PT, on the patient page, with the way in to edit it. */
export function PlanSection({ patient, onEdit }: { readonly patient: PatientSummary; readonly onEdit: () => void }) {
  const { source, plan } = patient.writtenPlan
  return (
    <section className="panel" aria-labelledby="plan-title">
      <div className="week-head">
        <h2 id="plan-title">{copy.planTitle}</h2>
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          {source === 'pt' ? copy.planEdit : copy.planWrite}
        </button>
      </div>
      {source === 'pt' && plan && plan.author.kind === 'pt' ? (
        <p className="small muted">
          {`${copy.planBy(plan.author.name, plan.version, shortDate(plan.publishedOn))} · ${plan.adaptation === 'lighter-on-flare' ? copy.planLighter : copy.planAsWritten}`}
        </p>
      ) : (
        <p className="small muted">{source === 'typed' ? copy.planTyped : copy.planNone}</p>
      )}
      {plan && plan.entries.length > 0 ? (
        <ul className="plan-list">
          {plan.entries.map((e) => (
            <li key={e.id} className="plan-item">
              <span>{e.name}</span>
              <span className="num plan-dose">{doseText(e.dose)}</span>
              <span className="small muted">{copy.planDays(e.daysPerWeek)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
