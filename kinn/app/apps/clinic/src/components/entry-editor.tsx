import type { Dose, PlanEntry } from '@reco/core'

import { copy } from '../copy'
import { setDoseField, setDoseNote, setPerSide } from '../plan-draft'
import type { DoseField } from '../plan-draft'

const DAYS = [1, 2, 3, 4, 5, 6, 7] as const

/** A drawn chevron for the move buttons, one stroke weight with the rest of the page. */
function Chevron({ up }: { readonly up: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d={up ? 'M3 9 L7 5 L11 9' : 'M3 5 L7 9 L11 5'} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
const FIELDS: readonly { field: DoseField; label: string }[] = [
  { field: 'sets', label: copy.fieldSets },
  { field: 'reps', label: copy.fieldReps },
  { field: 'seconds', label: copy.fieldSeconds },
  { field: 'minutes', label: copy.fieldMinutes },
]

function DoseFields({ id, dose, onChange }: { readonly id: string; readonly dose: Dose; readonly onChange: (d: Dose) => void }) {
  return (
    <div className="dose">
      {FIELDS.map(({ field, label }) => (
        <label key={field} className="field field-num">
          <span>{label}</span>
          <input inputMode="numeric" value={dose[field] ?? ''} onChange={(e) => onChange(setDoseField(dose, field, e.target.value))} aria-describedby={`${id}-name`} />
        </label>
      ))}
      <label className="check">
        <input type="checkbox" checked={dose.perSide === true} onChange={(e) => onChange(setPerSide(dose, e.target.checked))} />
        <span>{copy.fieldPerSide}</span>
      </label>
      <label className="field field-note">
        <span>{copy.fieldNote}</span>
        <input value={dose.note ?? ''} onChange={(e) => onChange(setDoseNote(dose, e.target.value))} />
      </label>
    </div>
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

/** One exercise in the draft: name, dose, days a week, and the lighter dose when the plan uses it. */
export function EntryEditor({ entry, index, count, showLighter, onChange, onMove, onRemove }: EntryEditorProps) {
  const id = `entry-${entry.id}`
  return (
    <li className="entry">
      <div className="entry-head">
        <label className="field field-name">
          <span>{copy.fieldName}</span>
          <input id={`${id}-name`} value={entry.name} onChange={(e) => onChange({ name: e.target.value })} />
        </label>
        <label className="field">
          <span>{copy.fieldDays}</span>
          <select value={entry.daysPerWeek} onChange={(e) => onChange({ daysPerWeek: Number(e.target.value) })}>
            {DAYS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <div className="entry-tools">
          <button type="button" className="btn btn-ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label={copy.moveUp(entry.name)}><Chevron up /></button>
          <button type="button" className="btn btn-ghost" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={copy.moveDown(entry.name)}><Chevron up={false} /></button>
          <button type="button" className="btn btn-ghost" onClick={onRemove}>{copy.remove}</button>
        </div>
      </div>
      <DoseFields id={id} dose={entry.dose} onChange={(dose) => onChange({ dose })} />
      {showLighter ? (
        <div className="lighter">
          <span className="small muted">{copy.lighterDose}</span>
          <DoseFields id={`${id}-light`} dose={entry.lightDose ?? entry.dose} onChange={(lightDose) => onChange({ lightDose })} />
        </div>
      ) : null}
    </li>
  )
}
