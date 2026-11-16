import type { PatientSummary } from '@reco/core'

import wordmark from '../assets/reco-wordmark-ceramic.svg'
import { copy } from '../copy'
import type { WaitingPatient } from '../live'
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

/** What the rail shows around the list: sample patients, or the signed-in PT's own. */
export interface RailChrome {
  readonly mode: 'sample' | 'live'
  readonly accountName?: string
  readonly waiting?: readonly WaitingPatient[]
  readonly loading?: boolean
  readonly loadError?: string | undefined
  readonly onRetry?: () => void
  readonly onAdd?: () => void
  readonly onSignOut?: () => void
  /** In sample mode on a build that has a server: the way to your own patients. */
  readonly onSignIn?: () => void
}

interface PatientListProps {
  readonly patients: readonly PatientSummary[]
  readonly selectedId: string | undefined
  readonly onSelect: (id: string, viaKeyboard: boolean) => void
  readonly chrome?: RailChrome
}

const SAMPLE: RailChrome = { mode: 'sample' }

/** The caseload, most urgent first. Arrow keys move through it. */
export function PatientList({ patients, selectedId, onSelect, chrome = SAMPLE }: PatientListProps) {
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
  const live = chrome.mode === 'live'
  const waiting = chrome.waiting ?? []
  return (
    <nav className="rail" aria-label={copy.listTitle}>
      <img className="wordmark" src={wordmark} alt={copy.appName} width={86} height={26} />
      <div className="rail-head">
        <h2>{copy.listTitle}</h2>
        {live ? null : <span className="sample">{copy.sampleTag}</span>}
      </div>
      <p className="rail-note" aria-live="polite">
        {!live ? copy.sampleNote : chrome.loading ? copy.loading : chrome.loadError ? copy.loadFailed : copy.liveNoteRail(patients.length + waiting.length)}
      </p>
      {live && chrome.loadError ? (
        <div className="rail-actions">
          <p className="rail-note">{chrome.loadError}</p>
          <button type="button" className="btn btn-rail" onClick={chrome.onRetry}>{copy.tryAgain}</button>
        </div>
      ) : null}
      <ul className="rows" onKeyDown={onKey}>
        {patients.map((p) => (
          <Row key={p.id} patient={p} selected={p.id === selectedId} onSelect={onSelect} />
        ))}
      </ul>
      {waiting.length > 0 ? (
        <section className="rail-waiting" aria-labelledby="waiting-title">
          <h3 id="waiting-title">{copy.waitingTitle}</h3>
          <ul>
            {waiting.map((w) => (
              <li key={w.id}>
                <span className="row-name">{w.name || copy.addPatient}</span>
                <span className="row-sub">{w.unreadable ? copy.unreadableRow : copy.waitingRow}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="rail-foot">
        {live ? (
          <>
            <button type="button" className="btn btn-rail btn-rail-solid" onClick={chrome.onAdd}>{copy.addPatient}</button>
            <p className="rail-note">{copy.signedInAs(chrome.accountName ?? '')}</p>
            <button type="button" className="btn btn-rail" onClick={chrome.onSignOut}>{copy.signOut}</button>
          </>
        ) : chrome.onSignIn ? (
          <button type="button" className="btn btn-rail" onClick={chrome.onSignIn}>{copy.backToSignIn}</button>
        ) : null}
      </div>
    </nav>
  )
}
