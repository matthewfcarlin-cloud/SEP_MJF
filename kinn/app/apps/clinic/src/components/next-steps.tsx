import { criterionValueWords, projectionWords } from '@reco/core'
import type { CriterionView, PatientSummary } from '@reco/core'

import { copy } from '../copy'

function Checkpoints({ items, caption }: { readonly items: readonly CriterionView[]; readonly caption: string }) {
  return (
    <table className="table" aria-label={caption}>
      <thead>
        <tr>
          <th scope="col">{copy.colCheckpoint}</th>
          <th scope="col" className="col-latest">{copy.colLatest}</th>
          <th scope="col" className="col-by">{copy.colMeasuredBy}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const projection = item.blockedByLimit ? copy.blocked : projectionWords(item.projection, 'clinician')
          return (
            <tr key={item.criterion.id}>
              <th scope="row">{item.criterion.label}</th>
              <td>
                <span className="stack-tight">
                  <span>{criterionValueWords(item, 'clinician')}</span>
                  {projection ? <span className="small muted">{projection}</span> : null}
                </span>
              </td>
              <td className="col-by">{copy.by[item.criterion.measuredBy]}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** How the phase moves on, the open checkpoints, and the ones that need the PT in person. */
export function NextStepsSection({ patient }: { readonly patient: PatientSummary }) {
  const { phaseLine, open, forClinic } = patient.nextSteps
  const athome = open.filter((c) => c.criterion.measuredBy !== 'pt')
  return (
    <section className="card" aria-labelledby="next-title">
      <header className="card-head"><h2 id="next-title">{copy.nextTitle}</h2></header>
      <div className="card-body stack">
        <p>{phaseLine}</p>
        {patient.path && open.length === 0 ? <p className="muted">{copy.allMet}</p> : null}
      </div>
      {athome.length > 0 ? <Checkpoints items={athome} caption={copy.nextTitle} /> : null}
      {forClinic.length > 0 ? (
        <>
          <h3 className="card-subhead">{copy.forClinic}</h3>
          <Checkpoints items={forClinic} caption={copy.forClinic} />
        </>
      ) : null}
    </section>
  )
}
