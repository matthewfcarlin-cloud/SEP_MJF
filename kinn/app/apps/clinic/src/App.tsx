import { caseloadOrder, dayKey, patientSummary, sampleCaseload } from '@reco/core'
import type { InviteView, PatientSummary, RecoveryPlan, ShareScope } from '@reco/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SAMPLE_CHROME } from './chrome'
import type { ClinicChrome } from './chrome'
import { AddPatient } from './components/add-patient'
import { PatientDetail } from './components/patient-detail'
import { PatientsPage } from './components/patients-page'
import { PlanEditor } from './components/plan-editor'
import { SignIn } from './components/sign-in'
import { TopBar } from './components/top-bar'
import { copy } from './copy'
import { liveCaseload } from './live'
import { apiUrl } from './session'
import { useLive } from './use-live'
import { usePlans } from './use-plans'
import { usePublishedNote } from './use-published-note'
import { useSelection } from './use-selection'
import type { ChartView } from './use-selection'

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

/** A tab of a patient's chart, their plan editor, or adding a patient. With nobody picked, the patients table. */
export type ClinicView = ChartView | 'add'

interface ClinicProps {
  readonly today: string
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  readonly view?: ClinicView
  /** Opens a patient's chart on a tab; used when the editor closes. */
  readonly onSelect?: (id: string, view?: ChartView) => void
  readonly onPublish?: (id: string, plan: RecoveryPlan) => void | Promise<void>
  /** Just published for the open patient: their exercise plan tab says so. */
  readonly publishedVersion?: number
  /** Sample patients when missing. */
  readonly chrome?: ClinicChrome
  /** Live only: what each patient shares, and how to make a sharing code. */
  readonly scopes?: Readonly<Record<string, readonly ShareScope[]>>
  readonly onCreateInvite?: () => Promise<InviteView>
}

const noop = (): void => undefined
const noInvite = (): Promise<InviteView> => Promise.reject(new Error('Sign in to make a sharing code.'))

/** The site, without state, so tests can render it for any day, patient and view. One thing per page. */
export function Clinic({ today, patients, selectedId, view = 'detail', onSelect = noop, onPublish = noop, publishedVersion, chrome = SAMPLE_CHROME, scopes, onCreateInvite = noInvite }: ClinicProps) {
  const live = chrome.mode === 'live'
  // A link to someone who isn't on the list (an old link, a stopped share) lands on the patients table.
  const open = patients.find((p) => p.id === selectedId)
  const nobodyYet = live && patients.length === 0 && (chrome.waiting ?? []).length === 0 && !chrome.loading && !chrome.loadError
  const adding = live && (view === 'add' || nobodyYet)
  return (
    <div className="shell">
      <TopBar chrome={chrome} />
      {adding ? (
        <AddPatient onCreate={onCreateInvite} empty={nobodyYet} />
      ) : open && view === 'plan' ? (
        <PlanEditor
          key={`${open.id}-plan`}
          patient={open}
          today={today}
          {...(live && chrome.accountName ? { author: chrome.accountName } : {})}
          onPublish={(plan) => onPublish(open.id, plan)}
          onClose={() => onSelect(open.id, 'exercises')}
        />
      ) : open ? (
        <PatientDetail
          key={open.id}
          patient={open}
          today={today}
          tab={view === 'add' || view === 'plan' ? 'detail' : view}
          {...(scopes?.[open.id] ? { scopes: scopes[open.id] } : {})}
          {...(publishedVersion !== undefined ? { publishedVersion } : {})}
        />
      ) : (
        <PatientsPage patients={patients} chrome={chrome} />
      )}
      <footer className="foot">{live ? copy.liveFooter : copy.footer}</footer>
    </div>
  )
}

/** Which page is open, the same for sample and real patients. A new page starts at its top, with focus on its heading. */
function useClinicNav() {
  const { selection, adding, select } = useSelection()
  const view: ClinicView = adding ? 'add' : selection?.view ?? 'detail'
  // Tabs of one chart are the same page: switching between them keeps the scroll and the focus.
  const page = adding ? 'add' : selection ? `${selection.view === 'plan' ? 'plan' : 'chart'}:${selection.id}` : 'list'
  const lastPage = useRef(page)
  useEffect(() => {
    if (lastPage.current === page) return
    lastPage.current = page
    window.scrollTo({ top: 0 })
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [page])
  const [publishedVersion, announce] = usePublishedNote(selection ? `${selection.id}:${selection.view}` : page)
  /** After a publish: back to the patient's exercise plan, which says which version went out. */
  const published = (id: string, version: number): void => { announce(`${id}:exercises`, version); select(id, 'exercises') }
  return { selectedId: selection?.id, view, select, publishedVersion, published }
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
      patients={patients}
      selectedId={nav.selectedId}
      view={nav.view === 'add' ? 'detail' : nav.view}
      onSelect={nav.select}
      onPublish={(id, plan) => { publishPlan(id, plan); nav.published(id, plan.version) }}
      {...(nav.publishedVersion !== undefined ? { publishedVersion: nav.publishedVersion } : {})}
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
      patients={caseload.patients}
      selectedId={nav.selectedId}
      view={nav.view}
      onSelect={nav.select}
      onPublish={async (id, plan) => { await live.publish(id, plan); nav.published(id, plan.version) }}
      {...(nav.publishedVersion !== undefined ? { publishedVersion: nav.publishedVersion } : {})}
      scopes={caseload.scopes}
      onCreateInvite={live.createInvite}
      chrome={{
        mode: 'live',
        accountName: account.name,
        waiting: caseload.waiting,
        loading: live.shared === undefined && live.loadError === undefined,
        loadError: live.loadError,
        onRetry: () => void live.refresh(),
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
