import { caseloadOrder, dayKey, patientSummary, sampleCaseload } from '@reco/core'
import type { PatientSummary } from '@reco/core'
import { useEffect, useMemo, useState } from 'react'

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
  /** Hours of today already passed, so the week ring stops at now. */
  readonly nowHour: number
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  readonly onSelect: (id: string, viaKeyboard: boolean) => void
  readonly animateRing?: boolean
}

/** The page, without state, so tests can render it for any day and selection. */
export function Clinic({ today, nowHour, patients, selectedId, onSelect, animateRing = false }: ClinicProps) {
  // With nothing picked, open the most urgent patient: the top of the list is where to start.
  const open = patients.find((p) => p.id === selectedId) ?? patients[0]
  return (
    <div className="app">
      <PatientList patients={patients} selectedId={open?.id} onSelect={onSelect} />
      {open ? (
        <div>
          <PatientDetail key={open.id} patient={open} today={today} nowHour={nowHour} animateRing={animateRing} />
          <footer className="foot main" style={{ paddingTop: 0 }}>{copy.footer}</footer>
        </div>
      ) : (
        <p className="main muted">{copy.pickOne}</p>
      )}
    </div>
  )
}

/** Matches the stacked layout in styles.css, where the detail sits below the list. */
const STACKED = '(max-width: 860px)'
const REDUCED = '(prefers-reduced-motion: reduce)'

const hourNow = (): number => {
  const d = new Date()
  return d.getHours() + d.getMinutes() / 60
}

export function App() {
  const today = dayKey(Date.now())
  const patients = useMemo(() => buildCaseload(today), [today])
  const [selectedId, select] = useSelection()
  const [viaKeyboard, setViaKeyboard] = useState(false)
  // Pointer picks refill the ring; keyboard picks and reduced motion never animate.
  const animateRing = !viaKeyboard && typeof window !== 'undefined' && !window.matchMedia(REDUCED).matches
  const onSelect = (id: string, keyboard: boolean) => {
    setViaKeyboard(keyboard)
    select(id)
  }
  // A new patient opens at their top. Stacked on a phone, that is below the list, so scroll to it.
  useEffect(() => {
    if (selectedId === undefined) return
    if (window.matchMedia(STACKED).matches) document.getElementById('patient-name')?.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0 })
  }, [selectedId])
  return <Clinic today={today} nowHour={hourNow()} patients={patients} selectedId={selectedId} onSelect={onSelect} animateRing={animateRing} />
}
