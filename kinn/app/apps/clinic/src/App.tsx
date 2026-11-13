import { caseloadOrder, dayKey, patientSummary, sampleCaseload } from '@reco/core'
import type { PatientSummary } from '@reco/core'
import { useEffect, useMemo } from 'react'

import { PatientDetail } from './components/patient-detail'
import { PatientList } from './components/patient-list'
import { copy } from './copy'
import { useSelection } from './use-selection'

/** The sample caseload for a given day, summarised by the same core logic the patient app uses. */
export function buildCaseload(today: string): readonly PatientSummary[] {
  return caseloadOrder(sampleCaseload(today).map((p) => patientSummary(p.id, p.data, today)))
}

interface ClinicProps {
  readonly today: string
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  readonly onSelect: (id: string) => void
}

/** The page, without state, so tests can render it for any day and selection. */
export function Clinic({ today, patients, selectedId, onSelect }: ClinicProps) {
  // With nothing picked, open the most urgent patient: the top of the list is where to start.
  const open = patients.find((p) => p.id === selectedId) ?? patients[0]
  return (
    <div className="page">
      <header className="top">
        <span className="brand">{copy.appName}</span>
        <span className="muted">{copy.appSub}</span>
      </header>
      <main className="layout">
        <PatientList patients={patients} selectedId={open?.id} onSelect={onSelect} />
        {open ? <PatientDetail key={open.id} patient={open} today={today} /> : <p className="muted">{copy.pickOne}</p>}
      </main>
      <footer className="foot small muted">{copy.footer}</footer>
    </div>
  )
}

/** Matches the stacked layout in styles.css, where the detail sits below the list. */
const STACKED = '(max-width: 820px)'

export function App() {
  const today = dayKey(Date.now())
  const patients = useMemo(() => buildCaseload(today), [today])
  const [selectedId, select] = useSelection()
  // Stacked on a phone, the detail is below the list: bring it into view when a patient is picked.
  useEffect(() => {
    if (selectedId === undefined || !window.matchMedia(STACKED).matches) return
    document.getElementById('patient-name')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedId])
  return <Clinic today={today} patients={patients} selectedId={selectedId} onSelect={select} />
}
