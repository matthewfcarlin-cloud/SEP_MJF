import { validatePlan } from '@reco/core'
import type { PatientSummary, RecoveryPlan } from '@reco/core'
import { useState } from 'react'

import { copy } from '../copy'
import { addCustom, addFromLibrary, moveEntry, removeEntry, setAdaptation, setAuthor, startDraft, updateEntry } from '../plan-draft'
import { EntryEditor } from './entry-editor'
import { LibraryPicker } from './library-picker'

let counter = 0
/** A fresh entry id; unique within a session, which is all a draft needs before the backend assigns ids. */
const newId = (): string => `e-${Date.now().toString(36)}-${(counter += 1)}`

interface PlanEditorProps {
  readonly patient: PatientSummary
  readonly today: string
  readonly onPublish: (plan: RecoveryPlan) => void
  readonly onClose: () => void
}

/**
 * Writing a patient's plan: type exercises in, or pick from the library and edit them, set what
 * happens on flare-up mornings, then publish the next version. Problems show before publishing,
 * from the same check the backend will run.
 */
export function PlanEditor({ patient, today, onPublish, onClose }: PlanEditorProps) {
  const current = patient.writtenPlan.source === 'pt' ? patient.writtenPlan.plan : undefined
  const [draft, setDraft] = useState<RecoveryPlan>(() => startDraft(current, patient.id, today))
  const [tried, setTried] = useState(false)
  const problems = validatePlan(draft)
  const empty = draft.entries.length === 0
  const lighter = draft.adaptation === 'lighter-on-flare'

  const publish = () => {
    setTried(true)
    if (problems.length > 0 || empty) return
    onPublish(draft)
  }

  return (
    <article className="main" aria-labelledby="editor-title">
      <button type="button" className="btn btn-ghost back" onClick={onClose}>{copy.editorBack(patient.name)}</button>
      <header className="patient-head">
        <h1 id="editor-title">{copy.editorTitle(patient.name)}</h1>
        <p className="patient-facts">{copy.editorVersion(draft.version, current?.version)}</p>
      </header>
      <div className="body editor-body">
        <div className="side">
          <section className="panel" aria-labelledby="author-title">
            <h2 id="author-title">{copy.authorLabel}</h2>
            <label className="field field-name">
              <span className="sr-only">{copy.authorLabel}</span>
              <input value={draft.author.kind === 'pt' ? draft.author.name : ''} placeholder={copy.authorPlaceholder} onChange={(e) => setDraft(setAuthor(draft, e.target.value))} />
            </label>
          </section>
          <section className="panel" aria-labelledby="entries-title">
            <h2 id="entries-title">{copy.exercisesTitle}</h2>
            {empty ? <p className="muted">{copy.noEntries}</p> : null}
            <ol className="entries">
              {draft.entries.map((e, i) => (
                <EntryEditor
                  key={e.id}
                  entry={e}
                  index={i}
                  count={draft.entries.length}
                  showLighter={lighter}
                  onChange={(patch) => setDraft(updateEntry(draft, e.id, patch))}
                  onMove={(by) => setDraft(moveEntry(draft, e.id, by))}
                  onRemove={() => setDraft(removeEntry(draft, e.id))}
                />
              ))}
            </ol>
            <button type="button" className="btn btn-secondary" onClick={() => setDraft(addCustom(draft, newId()))}>{copy.addOwn}</button>
          </section>
          <section className="panel" aria-labelledby="adapt-title">
            <h2 id="adapt-title">{copy.adaptationTitle}</h2>
            <div className="choices" role="radiogroup" aria-labelledby="adapt-title">
              <label className="check">
                <input type="radio" name="adaptation" checked={!lighter} onChange={() => setDraft(setAdaptation(draft, 'as-written'))} />
                <span>{copy.adaptationAsWritten}</span>
              </label>
              <label className="check">
                <input type="radio" name="adaptation" checked={lighter} onChange={() => setDraft(setAdaptation(draft, 'lighter-on-flare'))} />
                <span>{copy.adaptationLighter}</span>
              </label>
            </div>
            <p className="small muted">{copy.adaptationHint}</p>
          </section>
          <section className="panel publish" aria-live="polite">
            {tried && (problems.length > 0 || empty) ? (
              <div className="problems" role="alert">
                <h3>{copy.problemsTitle}</h3>
                <ul>
                  {(empty ? [copy.noEntries, ...problems] : problems).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={publish}>{copy.publish(draft.version)}</button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>{copy.cancel}</button>
            </div>
            <p className="small muted">{copy.backendNote}</p>
          </section>
        </div>
        <div className="ring-col">
          <LibraryPicker draft={draft} path={patient.path} onAdd={(exercise) => setDraft(addFromLibrary(draft, exercise, newId()))} />
        </div>
      </div>
    </article>
  )
}
