import { caseloadOrder, dayKey, patientSummary, sampleCaseload } from '@reco/core'
import type { PatientSummary, RecoveryPlan } from '@reco/core'
import { useEffect, useMemo, useState } from 'react'

import { PatientDetail } from './components/patient-detail'
import { PatientList } from './components/patient-list'
import { PlanEditor } from './components/plan-editor'
import { copy } from './copy'
import { usePlans } from './use-plans'
import { useSelection } from './use-selection'

/**
 * The sample caseload for a given day, summarised by the same core logic the patient app uses.
 * A plan the PT published here replaces the patient's sample plan.
 */
export function buildCaseload(today: string, plans: Readonly<Record<string, RecoveryPlan>> = {}): readonly PatientSummary[] {
  return caseloadOrder(sampleCaseload(today).map((p) => {
    const published = plans[p.id]
    return patientSummary(p.id, published ? { ...p.data, ptPlan: published } : p.data, today)
  }))
}

interface ClinicProps {
  readonly today: string
  /** Hours of today already passed, so the week ring stops at now. */
  readonly nowHour: number
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  /** Which view of the open patient: their page, or the plan editor. */
  readonly view?: 'detail' | 'plan'
  readonly onSelect: (id: string, viaKeyboard: boolean) => void
  readonly onOpenPlan?: (id: string) => void
  readonly onPublish?: (id: string, plan: RecoveryPlan) => void
  readonly animateRing?: boolean
}

const noop = (): void => undefined

/** The page, without state, so tests can render it for any day and selection. */
export function Clinic({ today, nowHour, patients, selectedId, view = 'detail', onSelect, onOpenPlan = noop, onPublish = noop, animateRing = false }: ClinicProps) {
  // With nothing picked, open the most urgent patient: the top of the list is where to start.
  const open = patients.find((p) => p.id === selectedId) ?? patients[0]
  return (
    <div className="app">
      <PatientList patients={patients} selectedId={open?.id} onSelect={onSelect} />
      {open ? (
        <div>
          {view === 'plan' ? (
            <PlanEditor key={`${open.id}-plan`} patient={open} today={today} onPublish={(plan) => onPublish(open.id, plan)} onClose={() => onSelect(open.id, false)} />
          ) : (
            <PatientDetail key={open.id} patient={open} today={today} nowHour={nowHour} animateRing={animateRing} onEditPlan={() => onOpenPlan(open.id)} />
          )}
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
  const [plans, publishPlan] = usePlans()
  const patients = useMemo(() => buildCaseload(today, plans), [today, plans])
  const { selection, select, openPlan } = useSelection()
  const selectedId = selection?.id
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
  }, [selectedId, selection?.view])
  const onPublish = (id: string, plan: RecoveryPlan) => {
    publishPlan(id, plan)
    select(id)
  }
  return (
    <Clinic
      today={today}
      nowHour={hourNow()}
      patients={patients}
      selectedId={selectedId}
      view={selection?.view ?? 'detail'}
      onSelect={onSelect}
      onOpenPlan={openPlan}
      onPublish={onPublish}
      animateRing={animateRing}
    />
  )
}
