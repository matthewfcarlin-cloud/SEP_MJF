import { caseloadOrder, dayKey, patientSummary, sampleCaseload } from '@reco/core'
import type { InviteView, PatientSummary, RecoveryPlan, ShareScope } from '@reco/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import { AddPatient } from './components/add-patient'
import { PatientDetail } from './components/patient-detail'
import { PatientList } from './components/patient-list'
import type { RailChrome } from './components/patient-list'
import { PlanEditor } from './components/plan-editor'
import { SignIn } from './components/sign-in'
import { copy } from './copy'
import { liveCaseload } from './live'
import { apiUrl } from './session'
import { useLive } from './use-live'
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

export type ClinicView = 'detail' | 'plan' | 'add'

interface ClinicProps {
  readonly today: string
  /** Hours of today already passed, so the week ring stops at now. */
  readonly nowHour: number
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  /** Which view is open: a patient's page, their plan editor, or adding a patient. */
  readonly view?: ClinicView
  readonly onSelect: (id: string, viaKeyboard: boolean) => void
  readonly onOpenPlan?: (id: string) => void
  readonly onPublish?: (id: string, plan: RecoveryPlan) => void | Promise<void>
  readonly animateRing?: boolean
  /** Sample patients when missing. */
  readonly chrome?: RailChrome
  /** Live only: what each patient shares, and how to make a sharing code. */
  readonly scopes?: Readonly<Record<string, readonly ShareScope[]>>
  readonly onCreateInvite?: () => Promise<InviteView>
  readonly onCloseAdd?: () => void
}

const noop = (): void => undefined
const noInvite = (): Promise<InviteView> => Promise.reject(new Error('Sign in to make a sharing code.'))

/** The page, without state, so tests can render it for any day and selection. */
export function Clinic({
  today, nowHour, patients, selectedId, view = 'detail', onSelect, onOpenPlan = noop, onPublish = noop, animateRing = false,
  chrome, scopes, onCreateInvite = noInvite, onCloseAdd = noop,
}: ClinicProps) {
  const live = chrome?.mode === 'live'
  // With nothing picked, open the most urgent patient: the top of the list is where to start.
  const open = patients.find((p) => p.id === selectedId) ?? patients[0]
  const waitingOnly = live && !open && !chrome?.loading && !chrome?.loadError
  const adding = live && (view === 'add' || waitingOnly)
  // A plan link for a patient who isn't on this list (an old link, a stopped share) opens nobody's editor.
  const editing = view === 'plan' && open !== undefined && open.id === selectedId
  const footer = <footer className="foot main foot-main">{live ? copy.liveFooter : copy.footer}</footer>
  return (
    <div className="app">
      <PatientList patients={patients} selectedId={adding ? undefined : open?.id} onSelect={onSelect} {...(chrome ? { chrome } : {})} />
      {adding ? (
        <div>
          <AddPatient onCreate={onCreateInvite} onClose={onCloseAdd} empty={!open} />
          {footer}
        </div>
      ) : open ? (
        <div>
          {editing ? (
            <PlanEditor
              key={`${open.id}-plan`}
              patient={open}
              today={today}
              {...(live && chrome?.accountName ? { author: chrome.accountName } : {})}
              onPublish={(plan) => onPublish(open.id, plan)}
              onClose={() => onSelect(open.id, false)}
            />
          ) : (
            <PatientDetail key={open.id} patient={open} today={today} nowHour={nowHour} animateRing={animateRing} onEditPlan={() => onOpenPlan(open.id)} {...(scopes?.[open.id] ? { scopes: scopes[open.id] } : {})} />
          )}
          {footer}
        </div>
      ) : (
        <p className="main muted" aria-live="polite">{chrome?.loading ? copy.loading : chrome?.loadError ?? copy.pickOne}</p>
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

/** Selection, ring animation and scroll: the same for sample and real patients. */
function useClinicNav() {
  const { selection, adding, select, openPlan, openAdd } = useSelection()
  const selectedId = selection?.id
  const [viaKeyboard, setViaKeyboard] = useState(false)
  // Pointer picks refill the ring; keyboard picks and reduced motion never animate.
  const animateRing = !viaKeyboard && typeof window !== 'undefined' && !window.matchMedia(REDUCED).matches
  const onSelect = (id: string, keyboard: boolean) => {
    setViaKeyboard(keyboard)
    select(id)
  }
  const view: ClinicView = adding ? 'add' : selection?.view ?? 'detail'
  // A new patient opens at their top. Stacked on a phone, that is below the list, so scroll to it.
  useEffect(() => {
    if (selectedId === undefined) return
    if (window.matchMedia(STACKED).matches) document.getElementById('patient-name')?.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0 })
  }, [selectedId, view])
  // Opening or leaving the editor or the add page replaces what had focus, so focus moves to the new
  // page's heading. Moving through the list with the arrow keys keeps focus in the list.
  const lastView = useRef(view)
  useEffect(() => {
    if (lastView.current === view) return
    lastView.current = view
    document.querySelector<HTMLElement>('article h1')?.focus({ preventScroll: true })
  }, [view])
  return { selectedId, view, animateRing, onSelect, select, openPlan, openAdd }
}

/** The six sample patients. A published plan is kept on this computer only. */
function SampleClinic({ onSignIn }: { readonly onSignIn?: () => void }) {
  const today = dayKey(Date.now())
  const [plans, publishPlan] = usePlans()
  const patients = useMemo(() => buildCaseload(today, plans), [today, plans])
  const nav = useClinicNav()
  return (
    <Clinic
      today={today}
      nowHour={hourNow()}
      patients={patients}
      selectedId={nav.selectedId}
      view={nav.view === 'add' ? 'detail' : nav.view}
      onSelect={nav.onSelect}
      onOpenPlan={nav.openPlan}
      onPublish={(id, plan) => { publishPlan(id, plan); nav.select(id) }}
      animateRing={nav.animateRing}
      chrome={{ mode: 'sample', ...(onSignIn ? { onSignIn } : {}) }}
    />
  )
}

/** A signed-in PT's own patients, from the server. */
function LiveClinic({ baseUrl, onSample }: { readonly baseUrl: string; readonly onSample: () => void }) {
  const today = dayKey(Date.now())
  const live = useLive(baseUrl)
  const nav = useClinicNav()
  const caseload = useMemo(() => liveCaseload(today, live.shared ?? []), [today, live.shared])
  const account = live.session?.account
  if (!account || account.name.trim() === '') {
    return <SignIn onStart={live.startSignIn} onVerify={live.verifySignIn} needsName={account !== undefined} onName={live.rename} onSample={onSample} />
  }
  return (
    <Clinic
      today={today}
      nowHour={hourNow()}
      patients={caseload.patients}
      selectedId={nav.selectedId}
      view={nav.view}
      onSelect={nav.onSelect}
      onOpenPlan={nav.openPlan}
      onPublish={async (id, plan) => { await live.publish(id, plan); nav.select(id) }}
      animateRing={nav.animateRing}
      scopes={caseload.scopes}
      onCreateInvite={live.createInvite}
      onCloseAdd={() => { const first = caseload.patients[0]; if (first) nav.select(first.id) }}
      chrome={{
        mode: 'live',
        accountName: account.name,
        waiting: caseload.waiting,
        loading: live.shared === undefined && live.loadError === undefined,
        loadError: live.loadError,
        onRetry: () => void live.refresh(),
        onAdd: nav.openAdd,
        onSignOut: () => void live.signOut(),
      }}
    />
  )
}

export function App() {
  const baseUrl = apiUrl()
  const [sample, setSample] = useState(false)
  if (!baseUrl) return <SampleClinic />
  if (sample) return <SampleClinic onSignIn={() => setSample(false)} />
  return <LiveClinic baseUrl={baseUrl} onSample={() => setSample(true)} />
}
