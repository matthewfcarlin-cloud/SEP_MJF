import type { PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { FlagChip } from './flags'
import { Ring } from './ring'

const LIST_RING = 34

function Row({ patient, selected, onSelect }: { readonly patient: PatientSummary; readonly selected: boolean; readonly onSelect: (id: string) => void }) {
  const { path, flags } = patient
  const top = flags[0]
  const where = path ? copy.phaseShort(path.phase.n, path.protocol.phases.length) : copy.noProtocol
  return (
    <li>
      <button type="button" className={`row${selected ? ' row-selected' : ''}`} aria-current={selected ? 'true' : undefined} onClick={() => onSelect(patient.id)}>
        {path ? <Ring met={path.metCount} required={path.requiredCount} size={LIST_RING} label={copy.ringLabel(path.metCount, path.requiredCount)} /> : <span className="ring-blank" />}
        <span className="row-main">
          <span className="row-name">{patient.name}</span>
          <span className="row-sub">{`${patient.surgeryLabel} · ${copy.week(patient.weeksIn)} · ${where}`}</span>
          {top ? <FlagChip tier={top.tier} label={top.title} /> : <span className="row-quiet">{copy.nothingNew}</span>}
        </span>
      </button>
    </li>
  )
}

interface PatientListProps {
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  readonly onSelect: (id: string) => void
}

/** The caseload, most urgent first. Each row shows the top flag so nothing alarming hides behind a click. */
export function PatientList({ patients, selectedId, onSelect }: PatientListProps) {
  return (
    <nav className="panel list" aria-label={copy.listTitle}>
      <div className="list-head">
        <h2>{copy.listTitle}</h2>
        <span className="tag">{copy.sampleTag}</span>
      </div>
      <p className="muted small">{copy.sampleNote}</p>
      <ul className="rows">
        {patients.map((p) => (
          <Row key={p.id} patient={p} selected={p.id === selectedId} onSelect={onSelect} />
        ))}
      </ul>
    </nav>
  )
}
