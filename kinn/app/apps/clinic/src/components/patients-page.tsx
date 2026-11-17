import type { PatientSummary } from '@reco/core'

import type { ClinicChrome } from '../chrome'
import { copy } from '../copy'
import { ADD_HREF, chartHref } from '../use-selection'
import { RecoveryBar } from './recovery-bar'
import { StatusTag } from './status-tag'

/** One patient, the same columns in the same place: who, what, how far along, what needs a look, the way in. */
function Row({ patient }: { readonly patient: PatientSummary }) {
  const top = patient.flags[0]
  const more = patient.flags.length - 1
  const week = Math.floor(patient.weeksIn)
  return (
    <tr>
      <th scope="row">
        <a className="row-name" href={chartHref(patient.id)}>{patient.name}</a>
        <span className="row-sub">{copy.rowSub(patient.surgeryLabel, patient.weeksIn)}</span>
        {top ? <span className="row-tag"><StatusTag tier={top.tier} /></span> : null}
      </th>
      <td className="col-wide">{patient.surgeryLabel}</td>
      <td className="col-wide num">{week}</td>
      <td><RecoveryBar path={patient.path} /></td>
      <td>
        {top ? (
          <span className="attention">
            <StatusTag tier={top.tier} />
            <span>{top.title}</span>
            {more > 0 ? <span className="muted small">{copy.moreFlags(more)}</span> : null}
          </span>
        ) : (
          <span className="muted">{copy.nothingNew}</span>
        )}
      </td>
      <td className="cell-action">
        <a className="btn btn-secondary" href={chartHref(patient.id)} aria-label={copy.openChartFor(patient.name)}>{copy.openChart}</a>
      </td>
    </tr>
  )
}

interface PatientsPageProps {
  readonly patients: readonly PatientSummary[]
  readonly chrome: ClinicChrome
}

/** Everyone at once, most urgent first: the morning scan. */
export function PatientsPage({ patients, chrome }: PatientsPageProps) {
  const live = chrome.mode === 'live'
  const waiting = chrome.waiting ?? []
  const note = !live ? copy.sampleNote : chrome.loading ? copy.loading : chrome.loadError ? copy.loadFailed : copy.liveNoteRail(patients.length + waiting.length)
  return (
    <main className="page" aria-labelledby="page-title">
      <header className="page-head">
        <div className="page-title">
          <h1 id="page-title" tabIndex={-1}>{copy.listTitle}</h1>
          <p className="muted" aria-live="polite">{note}</p>
        </div>
        {live ? <a className="btn btn-primary" href={ADD_HREF}>{copy.addPatient}</a> : null}
      </header>
      {live && chrome.loadError ? (
        <div className="alert alert-contact-soon" role="alert">
          <p>{chrome.loadError}</p>
          <div><button type="button" className="btn btn-secondary" onClick={chrome.onRetry}>{copy.tryAgain}</button></div>
        </div>
      ) : null}
      {patients.length > 0 ? (
        <section className="card" aria-label={copy.listTitle}>
          <table className="table patients">
            <thead>
              <tr>
                <th scope="col">{copy.colPatient}</th>
                <th scope="col" className="col-wide">{copy.colProcedure}</th>
                <th scope="col" className="col-wide">{copy.colWeek}</th>
                <th scope="col">{copy.colRecovery}</th>
                <th scope="col">{copy.colAttention}</th>
                <th scope="col"><span className="sr-only">{copy.openChart}</span></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <Row key={p.id} patient={p} />
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
      {waiting.length > 0 ? (
        <section className="card" aria-labelledby="waiting-title">
          <header className="card-head"><h2 id="waiting-title">{copy.waitingTitle}</h2></header>
          <ul className="waiting">
            {waiting.map((w) => (
              <li key={w.id}>
                <span className="waiting-name">{w.name || copy.addPatient}</span>
                <span className="muted">{w.unreadable ? copy.unreadableRow : copy.waitingRow}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
