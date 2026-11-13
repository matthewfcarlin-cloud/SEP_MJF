import type { PatientSummary } from '@reco/core'

import wordmark from '../assets/reco-wordmark-ceramic.svg'
import { copy } from '../copy'
import { MiniRing } from './mini-ring'
import { SeverityMark } from './severity'

interface RowProps {
  readonly patient: PatientSummary
  readonly selected: boolean
  readonly onSelect: (id: string, viaKeyboard: boolean) => void
}

/** The same furniture in the same place for every patient: the week, name, surgery, phase, top flag. */
function Row({ patient, selected, onSelect }: RowProps) {
  const { path, flags } = patient
  const top = flags[0]
  return (
    <li>
      <button type="button" className="row" aria-current={selected ? 'true' : undefined} onClick={(e) => onSelect(patient.id, e.detail === 0)}>
        <MiniRing ring={patient.ring} label={copy.miniRingLabel(patient.name)} />
        <span className="row-main">
          <span className="row-name">{patient.name}</span>
          <span className="row-sub">{copy.rowSub(patient.surgeryLabel, patient.weeksIn)}</span>
          <span className="row-sub">{path ? copy.rowPhase(path.phase.n, path.protocol.phases.length) : copy.noProtocol}</span>
          {top ? (
            <span className="row-flag">
              <SeverityMark tier={top.tier} size={11} />
              <span>
                <span className="sr-only">{`${copy.tier[top.tier]}: `}</span>
                {top.title}
              </span>
            </span>
          ) : (
            <span className="row-flag quiet">{copy.nothingNew}</span>
          )}
        </span>
      </button>
    </li>
  )
}

interface PatientListProps {
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  readonly onSelect: (id: string, viaKeyboard: boolean) => void
}

/** The caseload, most urgent first. Arrow keys move through it. */
export function PatientList({ patients, selectedId, onSelect }: PatientListProps) {
  const onKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('.row')]
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = Math.max(0, Math.min(buttons.length - 1, at + (e.key === 'ArrowDown' ? 1 : -1)))
    const patient = patients[next]
    if (!patient || next === at) return
    e.preventDefault()
    buttons[next]?.focus()
    onSelect(patient.id, true)
  }
  return (
    <nav className="rail" aria-label={copy.listTitle}>
      <img className="wordmark" src={wordmark} alt={copy.appName} width={86} height={26} />
      <div className="rail-head">
        <h2>{copy.listTitle}</h2>
        <span className="sample">{copy.sampleTag}</span>
      </div>
      <p className="rail-note">{copy.sampleNote}</p>
      <ul className="rows" onKeyDown={onKey}>
        {patients.map((p) => (
          <Row key={p.id} patient={p} selected={p.id === selectedId} onSelect={onSelect} />
        ))}
      </ul>
    </nav>
  )
}
