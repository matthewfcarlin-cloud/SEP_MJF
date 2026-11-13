import { criterionValueWords, projectionWords } from '@reco/core'
import type { CriterionView, PatientSummary } from '@reco/core'

import { copy } from '../copy'

function Checkpoint({ item }: { readonly item: CriterionView }) {
  const projection = item.blockedByLimit ? copy.blocked : projectionWords(item.projection, 'clinician')
  return (
    <li className="checkpoint">
      <span className={`dot dot-${item.status}`} />
      <span className="stack-xs grow">
        <span>{item.criterion.label}</span>
        <span className="small muted">{criterionValueWords(item, 'clinician')}</span>
        {projection ? <span className="small muted">{projection}</span> : null}
      </span>
      <span className={`badge badge-${item.criterion.measuredBy}`}>{copy.by[item.criterion.measuredBy]}</span>
    </li>
  )
}

/** How the phase moves on, the open checkpoints, and the ones that need the PT in person. */
export function NextStepsSection({ patient }: { readonly patient: PatientSummary }) {
  const { phaseLine, open, forClinic } = patient.nextSteps
  const athome = open.filter((c) => c.criterion.measuredBy !== 'pt')
  return (
    <section className="panel" aria-labelledby="next-title">
      <h3 id="next-title" className="label">{copy.nextTitle}</h3>
      <p>{phaseLine}</p>
      {patient.path && open.length === 0 ? <p className="muted small">{copy.allMet}</p> : null}
      {athome.length > 0 ? (
        <ul className="checkpoints">
          {athome.map((c) => (
            <Checkpoint key={c.criterion.id} item={c} />
          ))}
        </ul>
      ) : null}
      {forClinic.length > 0 ? (
        <div className="for-clinic">
          <span className="label">{copy.forClinic}</span>
          <ul className="checkpoints">
            {forClinic.map((c) => (
              <Checkpoint key={c.criterion.id} item={c} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
