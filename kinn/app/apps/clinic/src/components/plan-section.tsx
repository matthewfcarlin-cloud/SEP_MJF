import { doseText } from '@reco/core'
import type { PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { shortDate } from '../format'
import { chartHref } from '../use-selection'

/** The plan the patient follows from a PT, as a table, with the way in to write or change it. */
export function PlanSection({ patient }: { readonly patient: PatientSummary }) {
  const { source, plan } = patient.writtenPlan
  const fromPt = source === 'pt' && plan && plan.author.kind === 'pt'
  return (
    <section className="card" aria-labelledby="plan-title">
      <header className="card-head">
        <h2 id="plan-title">{copy.planTitle}</h2>
        {fromPt ? <span className="small muted">{copy.planBy(plan.author.name, plan.version, shortDate(plan.publishedOn))}</span> : null}
      </header>
      <div className="card-body stack">
        {fromPt ? (
          <p>{`${copy.adaptationTitle}: ${plan.adaptation === 'lighter-on-flare' ? copy.planLighter : copy.planAsWritten}.`}</p>
        ) : (
          <>
            <p className="muted">{source === 'typed' ? copy.planTyped : copy.planNone}</p>
            <div><a className="btn btn-primary" href={chartHref(patient.id, 'plan')}>{copy.planWrite}</a></div>
          </>
        )}
      </div>
      {plan && plan.entries.length > 0 ? (
        <table className="table">
          <thead>
            <tr><th scope="col">{copy.fieldName}</th><th scope="col">{copy.colDose}</th><th scope="col">{copy.colHowOften}</th></tr>
          </thead>
          <tbody>
            {plan.entries.map((e) => (
              <tr key={e.id}>
                <th scope="row">{e.name}</th>
                <td className="num">{doseText(e.dose)}</td>
                <td>{copy.planDays(e.daysPerWeek)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}
