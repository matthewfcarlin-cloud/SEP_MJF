import { catalogFor, CATEGORY_ORDER, libraryPhaseFor, searchCatalog } from '@reco/core'
import type { Exercise, ExerciseCategory, Metric, PathView, Phase, RecoveryPlan } from '@reco/core'
import { useState } from 'react'

import { copy } from '../copy'

const PHASES: readonly Phase[] = [1, 2, 3, 4]

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

/**
 * The knee library: search by name, narrow by plan phase and kind. It opens on the patient's own
 * phase, and each exercise names the checkpoints it works toward on that patient's protocol.
 */
export function LibraryPicker({ draft, path, onAdd }: LibraryPickerProps) {
  const catalog = catalogFor('knee')
  const [phase, setPhase] = useState<Phase | 'all'>(path ? libraryPhaseFor(path.phase.n) : 'all')
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const inPlan = new Set(draft.entries.flatMap((e) => (e.source.kind === 'library' ? [e.source.exerciseId] : [])))
  // A search looks through every phase: a PT typing "nordic" wants it wherever it lives.
  const searching = query.trim() !== ''
  const shown = searchCatalog(catalog, {
    query,
    ...(phase !== 'all' && !searching ? { phase } : {}),
    ...(category !== 'all' ? { category } : {}),
  })
  return (
    <section className="card library-panel" aria-labelledby="library-title">
      <header className="card-head"><h2 id="library-title">{copy.libraryTitle}</h2></header>
      <div className="card-body stack">
      <div className="library-filters">
        <label className="field field-search">
          <span>{copy.librarySearch}</span>
          <input type="search" value={query} placeholder={copy.librarySearchPlaceholder} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="field">
          <span>{copy.libraryPhaseLabel}</span>
          <select value={searching ? 'all' : phase} onChange={(e) => { setPhase(e.target.value === 'all' ? 'all' : (Number(e.target.value) as Phase)); setQuery('') }}>
            <option value="all">{copy.libraryAll}</option>
            {PHASES.map((n) => (
              <option key={n} value={n}>{copy.libraryPhase(n, catalog.find((c) => c.phase === n)?.phaseName ?? '')}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{copy.libraryKind}</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory | 'all')}>
            <option value="all">{copy.libraryAllKinds}</option>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>{copy.category[c]}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted" aria-live="polite">{copy.libraryCount(shown.length, catalog.length)}</p>
      {shown.length === 0 ? <p className="muted">{copy.libraryEmpty}</p> : null}
      <ul className="library">
        {shown.map((c) => {
          const added = inPlan.has(c.exercise.id)
          const toward = towardLabels(c.worksToward, path)
          return (
            <li key={c.exercise.id} className="library-item">
              <div className="library-text">
                <span className="library-name">{c.exercise.name}</span>
                <span className="small muted"><span className="num">{c.exercise.dose}</span>{` · ${c.exercise.how}`}</span>
                {toward.length > 0 ? <span className="small toward">{`${copy.worksToward}: ${toward.join('; ')}`}</span> : null}
                {c.caution ? <span className="small caution">{`${copy.libraryCaution}: ${c.caution}`}</span> : null}
              </div>
              <button type="button" className="btn btn-secondary" disabled={added} onClick={() => onAdd(c.exercise)} aria-label={`${added ? copy.libraryAdded : copy.libraryAdd}: ${c.exercise.name}`}>
                {added ? copy.libraryAdded : copy.libraryAdd}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="small muted">{copy.librarySource}</p>
      </div>
    </section>
  )
}
