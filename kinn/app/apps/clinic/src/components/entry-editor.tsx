import type { Dose, PlanEntry } from '@reco/core'
import { useState } from 'react'

import { copy } from '../copy'
import { lightDoseOf, setDoseField, setDoseNote, setPerSide, withDose } from '../plan-draft'
import type { DoseField } from '../plan-draft'

const DAYS = [1, 2, 3, 4, 5, 6, 7] as const

/** Drawn icons for the row tools, one stroke weight with the rest of the page. */
function Icon({ kind }: { readonly kind: 'up' | 'down' | 'remove' }) {
  const d = kind === 'up' ? 'M3 9 L7 5 L11 9' : kind === 'down' ? 'M3 5 L7 9 L11 5' : 'M3.5 3.5 L10.5 10.5 M10.5 3.5 L3.5 10.5'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface DoseLineProps {
  readonly name: string
  readonly dose: Dose
  readonly onChange: (d: Dose) => void
}

/** A dose written the way a PT says it: 3 sets × 12 reps, hold 5 s, 15 min. Empty boxes are left out. */
function DoseLine({ name, dose, onChange }: DoseLineProps) {
  const box = (field: DoseField, label: string) => (
    <input className="dose-box" inputMode="numeric" value={dose[field] ?? ''} aria-label={`${label}, ${name}`} onChange={(e) => onChange(setDoseField(dose, field, e.target.value.replace(/\D/g, '')))} />
  )
  // Written as PTs write it: 3 × 12 reps, 5 s hold, 15 min. Each number keeps its unit beside it when the line wraps.
  return (
    <span className="dose-line">
      <span className="dose-group">{box('sets', copy.fieldSets)}<span className="dose-unit">×</span>{box('reps', copy.fieldReps)}<span className="dose-unit">reps</span></span>
      <span className="dose-group">{box('seconds', copy.fieldSeconds)}<span className="dose-unit">s hold</span></span>
      <span className="dose-group">{box('minutes', copy.fieldMinutes)}<span className="dose-unit">min</span></span>
    </span>
  )
}

interface EntryEditorProps {
  readonly entry: PlanEntry
  readonly index: number
  readonly count: number
  readonly showLighter: boolean
  readonly onChange: (patch: Partial<Omit<PlanEntry, 'id' | 'source'>>) => void
  readonly onMove: (by: -1 | 1) => void
  readonly onRemove: () => void
}

/**
 * One exercise in the draft, in two lines: what and how often, then the dose. The flare-up dose
 * is a third line only when the plan uses it; the note opens when there is one to write.
 */
export function EntryEditor({ entry, index, count, showLighter, onChange, onMove, onRemove }: EntryEditorProps) {
  const [noteOpen, setNoteOpen] = useState(entry.dose.note !== undefined)
  const name = entry.name || copy.fieldName
  return (
    <li className="entry">
      <div className="entry-row entry-top">
        <span className="entry-n num" aria-hidden="true">{index + 1}</span>
        <input className="entry-name" value={entry.name} placeholder={copy.fieldName} aria-label={`${copy.fieldName} ${index + 1}`} onChange={(e) => onChange({ name: e.target.value })} />
        <select className="entry-days" value={entry.daysPerWeek} aria-label={`${copy.fieldDays}, ${name}`} onChange={(e) => onChange({ daysPerWeek: Number(e.target.value) })}>
          {DAYS.map((n) => (
            <option key={n} value={n}>{copy.daysOption(n)}</option>
          ))}
        </select>
        <div className="entry-tools">
          <button type="button" className="icon-btn" aria-disabled={index === 0} onClick={() => { if (index > 0) onMove(-1) }} aria-label={copy.moveUp(entry.name)}><Icon kind="up" /></button>
          <button type="button" className="icon-btn" aria-disabled={index === count - 1} onClick={() => { if (index < count - 1) onMove(1) }} aria-label={copy.moveDown(entry.name)}><Icon kind="down" /></button>
          <button type="button" className="icon-btn" onClick={onRemove} aria-label={`${copy.remove} ${name}`}><Icon kind="remove" /></button>
        </div>
      </div>
      <div className="entry-row entry-dose">
        <DoseLine name={name} dose={entry.dose} onChange={(dose) => onChange(withDose(entry, dose))} />
        <label className="check">
          <input type="checkbox" checked={entry.dose.perSide === true} onChange={(e) => onChange(withDose(entry, setPerSide(entry.dose, e.target.checked)))} />
          <span>{copy.fieldPerSide}</span>
        </label>
        {noteOpen ? null : <button type="button" className="link-btn" onClick={() => setNoteOpen(true)}>{copy.addNote}</button>}
      </div>
      {noteOpen ? (
        <div className="entry-row entry-dose">
          <input className="entry-note" value={entry.dose.note ?? ''} placeholder={copy.notePlaceholder} aria-label={`${copy.fieldNote}, ${name}`} onChange={(e) => onChange(withDose(entry, setDoseNote(entry.dose, e.target.value)))} />
        </div>
      ) : null}
      {showLighter ? (
        <div className="entry-row entry-dose entry-light">
          <span className="light-label">{copy.lighterDose}</span>
          <DoseLine name={`${name}, ${copy.lighterDose}`} dose={lightDoseOf(entry)} onChange={(lightDose) => onChange({ lightDose })} />
        </div>
      ) : null}
    </li>
  )
}
