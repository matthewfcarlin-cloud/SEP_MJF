import type { PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { relativeDay } from '../format'

function Phases({ patient }: { readonly patient: PatientSummary }) {
  const path = patient.path
  if (!path) return null
  return (
    <ol className="phases" aria-label={copy.phasesLabel}>
      {path.timeline.map((row) => (
        <li key={row.n} className={`phase phase-${row.status}`} aria-current={row.status === 'current' ? 'step' : undefined}>
          <span className="phase-bar" />
          <span>{row.name}</span>
        </li>
      ))}
    </ol>
  )
}

/** Phase and state, the six phases, and the numbers that move it: checkpoints, range, plan, limit. */
export function ProgressSection({ patient, today }: { readonly patient: PatientSummary; readonly today: string }) {
  const { path, latestRom: rom, plan, otherKnee } = patient
  return (
    <section className="panel" aria-labelledby="progress-title">
      <h2 id="progress-title">{copy.progressTitle}</h2>
      <div className="phase-line">
        <span className="phase-name">{path ? `${path.phase.n} · ${path.phase.name}` : copy.noProtocol}</span>
        {path ? <span className={`state state-${path.state}`}>{copy.state[path.state]}</span> : null}
      </div>
      <Phases patient={patient} />
      <dl className="facts">
        {path ? (
          <>
            <dt>{copy.checkpointsMet}</dt>
            <dd className="num">{`${path.metCount} / ${path.requiredCount}`}</dd>
          </>
        ) : null}
        {rom ? (
          <>
            <dt>{copy.bend}</dt>
            <dd className="num">{`${rom.flexionDeg}°`}</dd>
            {otherKnee ? (
              <>
                <dt>{copy.otherKnee}</dt>
                <dd className="num">{`${otherKnee.flexionDeg}°`}</dd>
              </>
            ) : null}
            <dt>{copy.straight}</dt>
            <dd>{rom.extensionDeficitDeg <= 0 ? copy.fullyStraight : copy.shortOf(rom.extensionDeficitDeg)}</dd>
            <dt>{copy.measured}</dt>
            <dd>{relativeDay(rom.date, today)}</dd>
          </>
        ) : (
          <>
            <dt>{copy.bend}</dt>
            <dd>{copy.noRange}</dd>
          </>
        )}
        <dt>{copy.plan}</dt>
        <dd>{plan.heldBack ? `${plan.name}, ${copy.heldBack}` : plan.name}</dd>
        {path?.limits.flexionMaxDeg ? (
          <>
            <dt>{copy.bendLimit}</dt>
            <dd className="limit num">{`${path.limits.flexionMaxDeg}°`}</dd>
          </>
        ) : null}
      </dl>
    </section>
  )
}
