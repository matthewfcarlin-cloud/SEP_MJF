import { addDays } from '@reco/core'
import type { ManualActivity, PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { relativeDay, shortDate, weekday } from '../format'

const ACTIVITY: Readonly<Record<ManualActivity, string>> = { practice: 'practice', game: 'game', gym: 'gym', pt: 'PT', walking: 'walking', rest: 'rest' }

function Mornings({ patient }: { readonly patient: PatientSummary }) {
  return (
    <ol className="mornings" aria-label="Mornings this week">
      {patient.week.summary.rows.map((row) => {
        const morningOf = addDays(row.load.date, 1)
        return (
          <li key={row.load.date} className={`morning morning-${row.morning}`} title={`${weekday(morningOf)}: ${copy.morning[row.morning]}`}>
            <span className="morning-dot" />
            <span className="small muted">{weekday(morningOf)}</span>
          </li>
        )
      })}
    </ol>
  )
}

function logged(counts: Partial<Record<ManualActivity, number>>): string {
  const parts = (Object.entries(counts) as [ManualActivity, number][]).map(([a, n]) => `${n} ${ACTIVITY[a]}`)
  return parts.length ? parts.join(', ') : copy.nothingLogged
}

/** The patient's week as their own PT report shows it: one headline, the mornings, the numbers. */
export function WeekSection({ patient, today }: { readonly patient: PatientSummary; readonly today: string }) {
  const { summary, headline } = patient.week
  const last = patient.lastCheckIn
  return (
    <section className="panel" aria-labelledby="week-title">
      <div className="split">
        <h3 id="week-title" className="label">{copy.weekTitle}</h3>
        <span className="small muted">{copy.weekRange(shortDate(summary.weekStart), shortDate(summary.weekEnd))}</span>
      </div>
      <p className="headline">{headline}</p>
      <Mornings patient={patient} />
      <dl className="facts">
        <div><dt>{copy.peakBend}</dt><dd>{summary.peakFlexionDeg !== undefined ? `${summary.peakFlexionDeg}°` : '–'}</dd></div>
        <div><dt>{copy.bestStraight}</dt><dd>{summary.bestExtensionDeficitDeg !== undefined ? (summary.bestExtensionDeficitDeg <= 0 ? copy.fullyStraight : copy.shortOf(summary.bestExtensionDeficitDeg)) : '–'}</dd></div>
        <div><dt>{copy.flareMornings}</dt><dd>{summary.flares.length}</dd></div>
        <div><dt>{copy.painLogs}</dt><dd>{summary.painLogCount}</dd></div>
      </dl>
      <p className="small"><span className="muted">{`${copy.logged}: `}</span>{logged(summary.activityCounts)}</p>
      {last ? <p className="small muted">{copy.lastCheckIn(relativeDay(last.date, today), last.pain, copy.swelling[last.swelling])}</p> : null}
    </section>
  )
}
