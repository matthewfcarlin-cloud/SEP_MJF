import type { PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { relativeDay } from '../format'
import { Ring } from './ring'

const DETAIL_RING = 84

function Metric({ label, value, foot }: { readonly label: string; readonly value: string; readonly foot?: string | undefined }) {
  const isNumber = /^\d/.test(value)
  return (
    <div className="metric">
      <span className="label">{label}</span>
      <span className={isNumber ? 'metric-value' : 'metric-words'}>{value}</span>
      {foot ? <span className="small muted">{foot}</span> : null}
    </div>
  )
}

function Phases({ patient }: { readonly patient: PatientSummary }) {
  const path = patient.path
  if (!path) return null
  return (
    <ol className="phases" aria-label="Protocol phases">
      {path.timeline.map((row) => (
        <li key={row.n} className={`phase phase-${row.status}`} title={row.name}>
          <span className="phase-dot" />
          <span className="phase-name">{row.name}</span>
        </li>
      ))}
    </ol>
  )
}

/** Phase and checkpoints, latest range against the other knee, and the plan phase. */
export function ProgressSection({ patient, today }: { readonly patient: PatientSummary; readonly today: string }) {
  const { path, latestRom: rom, plan, otherKnee } = patient
  return (
    <section className="panel" aria-labelledby="progress-title">
      <h3 id="progress-title" className="label">{copy.progressTitle}</h3>
      <div className="progress-top">
        {path ? <Ring met={path.metCount} required={path.requiredCount} size={DETAIL_RING} label={copy.ringLabel(path.metCount, path.requiredCount)} /> : null}
        <div className="stack-xs">
          <span className="phase-title">{path ? `${path.phase.n} · ${path.phase.name}` : copy.noProtocol}</span>
          {path ? <span className={`state state-${path.state}`}>{copy.state[path.state]}</span> : null}
          {path ? <span className="small muted">{copy.checkpoints(path.metCount, path.requiredCount)}</span> : null}
          <span className="small muted">{`${copy.planPhase(plan.name)}${plan.heldBack ? `, ${copy.heldBack}` : ''}`}</span>
          {path?.limits.flexionMaxDeg ? <span className="small limit">{copy.bendLimit(path.limits.flexionMaxDeg)}</span> : null}
        </div>
      </div>
      <Phases patient={patient} />
      {rom ? (
        <div className="metrics">
          <Metric label={copy.bend} value={`${rom.flexionDeg}°`} foot={otherKnee ? copy.otherKnee(otherKnee.flexionDeg) : undefined} />
          <Metric label={copy.straight} value={rom.extensionDeficitDeg <= 0 ? copy.fullyStraight : copy.shortOf(rom.extensionDeficitDeg)} foot={copy.measured(relativeDay(rom.date, today))} />
        </div>
      ) : (
        <p className="muted">{copy.noRange}</p>
      )}
    </section>
  )
}
