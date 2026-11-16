import { validatePlan } from '@reco/core'
import type { PatientSummary, RecoveryPlan } from '@reco/core'
import { useState } from 'react'

import { copy } from '../copy'
import { addCustom, addFromLibrary, moveEntry, removeEntry, setAdaptation, setAuthor, startDraft, updateEntry } from '../plan-draft'
import { messageOf } from '../use-live'
import { EntryEditor } from './entry-editor'
import { LibraryPicker } from './library-picker'

let counter = 0
/** A fresh entry id; unique within a session, and kept across versions so the patient's check-offs follow the exercise. */
const newId = (): string => `e-${Date.now().toString(36)}-${(counter += 1)}`

interface PlanEditorProps {
  readonly patient: PatientSummary
  readonly today: string
  /** The signed-in PT. With it the author is fixed; without it (sample patients) the PT types a name. */
  readonly author?: string
  readonly onPublish: (plan: RecoveryPlan) => void | Promise<void>
  readonly onClose: () => void
}

/**
 * Writing a patient's plan. The list of exercises is the page; the library sits beside it, the
 * flare-up choice above it, and publishing stays in view below it. Problems show before
 * publishing, from the same check the server runs.
 */
export function PlanEditor({ patient, today, author, onPublish, onClose }: PlanEditorProps) {
  const current = patient.writtenPlan.source === 'pt' ? patient.writtenPlan.plan : undefined
  const [draft, setDraft] = useState<RecoveryPlan>(() => {
    const started = startDraft(current, patient.id, today)
    return author !== undefined ? setAuthor(started, author) : started
  })
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | undefined>(undefined)
  const empty = draft.entries.length === 0
  const problems = empty ? [copy.noEntries, ...validatePlan(draft)] : validatePlan(draft)
  const lighter = draft.adaptation === 'lighter-on-flare'

  const publish = async () => {
    setTried(true)
    setSendError(undefined)
    if (problems.length > 0) return
    setSending(true)
    try {
      await onPublish(draft)
    } catch (error) {
      setSendError(messageOf(error))
      setSending(false)
    }
  }

  return (
    <article className="main" aria-labelledby="editor-title">
      <button type="button" className="btn btn-ghost back" onClick={onClose}>{copy.editorBack(patient.name)}</button>
      <header className="patient-head">
        <h1 id="editor-title" tabIndex={-1}>{copy.editorTitle(patient.name)}</h1>
        <p className="patient-facts">{copy.editorVersion(draft.version, current?.version)}</p>
      </header>
      <div className="body editor-body">
        <div className="side">
          <section className="panel plan-settings" aria-label={copy.adaptationTitle}>
            <div className="setting">
              <h2 id="adapt-title">{copy.adaptationTitle}</h2>
              <div className="seg" role="group" aria-labelledby="adapt-title">
                <button type="button" aria-pressed={!lighter} className="seg-btn" onClick={() => setDraft(setAdaptation(draft, 'as-written'))}>{copy.adaptationAsWritten}</button>
                <button type="button" aria-pressed={lighter} className="seg-btn" onClick={() => setDraft(setAdaptation(draft, 'lighter-on-flare'))}>{copy.adaptationLighter}</button>
              </div>
              <p className="small muted">{copy.adaptationHint}</p>
            </div>
            {author === undefined ? (
              <label className="field setting">
                <span className="setting-label">{copy.authorLabel}</span>
                <input value={draft.author.kind === 'pt' ? draft.author.name : ''} placeholder={copy.authorPlaceholder} onChange={(e) => setDraft(setAuthor(draft, e.target.value))} />
              </label>
            ) : null}
          </section>
          <section className="panel" aria-labelledby="entries-title">
            <div className="week-head">
              <h2 id="entries-title">{copy.exercisesTitle}</h2>
              <span className="small muted">{copy.entryCount(draft.entries.length)}</span>
            </div>
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
            <div><button type="button" className="btn btn-secondary" onClick={() => setDraft(addCustom(draft, newId()))}>{copy.addOwn}</button></div>
          </section>
          <section className="publish-bar" aria-label={copy.publish(draft.version)}>
            {tried && problems.length > 0 ? (
              <div className="problems" role="alert">
                <h3>{copy.problemsTitle}</h3>
                <ul>
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {sendError ? <p className="form-error" role="alert">{sendError}</p> : null}
            <div className="publish-row">
              <div className="actions">
                <button type="button" className="btn btn-primary" onClick={() => void publish()} disabled={sending}>{sending ? copy.publishing : copy.publish(draft.version)}</button>
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={sending}>{copy.cancel}</button>
              </div>
              <p className="small muted publish-note">
                {author !== undefined ? `${copy.publishingAs(author)}. ${copy.liveNote(patient.name)}` : copy.backendNote}
              </p>
            </div>
          </section>
        </div>
        <div className="ring-col">
          <LibraryPicker draft={draft} path={patient.path} onAdd={(exercise) => setDraft(addFromLibrary(draft, exercise, newId()))} />
        </div>
      </div>
    </article>
  )
}
