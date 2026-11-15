import { catalogFor, libraryPhaseFor } from '@reco/core'
import type { Exercise, Metric, PathView, RecoveryPlan } from '@reco/core'
import { useState } from 'react'

import { copy } from '../copy'

const PHASES = [1, 2, 3, 4] as const

/** This patient's checkpoint labels for the metrics an exercise trains, from their own protocol. */
function towardLabels(metrics: readonly Metric[], path: PathView | undefined): readonly string[] {
  if (!path) return []
  const criteria = path.protocol.phases.flatMap((p) => p.exitCriteria)
  const labels = metrics.map((m) => criteria.find((c) => c.metric === m)?.label).filter((l): l is string => l !== undefined)
  return [...new Set(labels)]
}

interface LibraryPickerProps {
  readonly draft: RecoveryPlan
  readonly path: PathView | undefined
  readonly onAdd: (exercise: Exercise) => void
}

/** Every knee exercise by phase, with what it works toward on this patient's protocol. Starts on their own phase. */
export function LibraryPicker({ draft, path, onAdd }: LibraryPickerProps) {
  const catalog = catalogFor('knee')
  const [phase, setPhase] = useState<number | 'all'>(path ? libraryPhaseFor(path.phase.n) : 'all')
  const inPlan = new Set(draft.entries.flatMap((e) => (e.source.kind === 'library' ? [e.source.exerciseId] : [])))
  const shown = catalog.filter((c) => phase === 'all' || c.phase === phase)
  return (
    <section className="panel" aria-labelledby="library-title">
      <h2 id="library-title">{copy.libraryTitle}</h2>
      <div className="seg" role="radiogroup" aria-label={copy.libraryTitle}>
        <button type="button" role="radio" aria-checked={phase === 'all'} className="seg-btn" onClick={() => setPhase('all')}>{copy.libraryAll}</button>
        {PHASES.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={phase === n} className="seg-btn" onClick={() => setPhase(n)}>
            {copy.libraryPhase(n, catalog.find((c) => c.phase === n)?.phaseName ?? '')}
          </button>
        ))}
      </div>
      <ul className="library">
        {shown.map((c) => {
          const added = inPlan.has(c.exercise.id)
          const toward = towardLabels(c.worksToward, path)
          return (
            <li key={c.exercise.id} className="library-item">
              <div className="stack" style={{ gap: 2 }}>
                <span className="library-name">{c.exercise.name}</span>
                <span className="small muted">{`${c.exercise.dose} · ${c.exercise.how}`}</span>
                {toward.length > 0 ? <span className="small toward">{`${copy.worksToward}: ${toward.join('; ')}`}</span> : null}
              </div>
              <button type="button" className="btn btn-secondary" disabled={added} onClick={() => onAdd(c.exercise)}>
                {added ? copy.libraryAdded : copy.libraryAdd}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
