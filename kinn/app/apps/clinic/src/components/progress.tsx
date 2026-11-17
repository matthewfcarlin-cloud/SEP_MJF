import type { PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { relativeDay } from '../format'
import { placeInList } from '../motion'

function Phases({ patient }: { readonly patient: PatientSummary }) {
  const path = patient.path
  if (!path) return null
  return (
    <ol className="phases" aria-label={copy.phasesLabel}>
      {path.timeline.map((row, i) => (
        <li key={row.n} className={`phase phase-${row.status}`} style={placeInList(i)} aria-current={row.status === 'current' ? 'step' : undefined}>
          <span className="phase-bar" />
          <span>{`${row.n}. ${row.name}`}</span>
        </li>
      ))}
    </ol>
  )
}

function Fact({ label, children, tone }: { readonly label: string; readonly children: React.ReactNode; readonly tone?: 'limit' }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd className={tone === 'limit' ? 'limit' : undefined}>{children}</dd>
    </div>
  )
}

/** Phase and state, the protocol's phases, and the numbers that move it: checkpoints, range, plan, limit. */
export function ProgressSection({ patient, today }: { readonly patient: PatientSummary; readonly today: string }) {
  const { path, latestRom: rom, plan, otherKnee } = patient
  return (
    <section className="card" aria-labelledby="progress-title">
      <header className="card-head">
        <h2 id="progress-title">{copy.progressTitle}</h2>
        {path ? <span className={`state state-${path.state}`}>{copy.state[path.state]}</span> : null}
      </header>
      <div className="card-body stack">
        <p className="phase-name">{path ? copy.phaseHeading(path.phase.n, path.protocol.phases.length, path.phase.name) : copy.noProtocol}</p>
        <Phases patient={patient} />
        <dl className="facts">
          {path ? <Fact label={copy.checkpointsMet}>{copy.countOf(path.metCount, path.requiredCount)}</Fact> : null}
          {rom ? (
            <>
              <Fact label={copy.bend}>{`${rom.flexionDeg}°`}</Fact>
              {otherKnee ? <Fact label={copy.otherKnee}>{`${otherKnee.flexionDeg}°`}</Fact> : null}
              <Fact label={copy.straight}>{rom.extensionDeficitDeg <= 0 ? copy.fullyStraight : copy.shortOf(rom.extensionDeficitDeg)}</Fact>
              <Fact label={copy.measured}>{relativeDay(rom.date, today)}</Fact>
            </>
          ) : (
            <Fact label={copy.bend}>{copy.noRange}</Fact>
          )}
          <Fact label={copy.plan}>{plan.heldBack ? `${plan.name}, ${copy.heldBack}` : plan.name}</Fact>
          {path?.limits.flexionMaxDeg ? <Fact label={copy.bendLimit} tone="limit">{`${path.limits.flexionMaxDeg}°`}</Fact> : null}
        </dl>
      </div>
    </section>
  )
}
