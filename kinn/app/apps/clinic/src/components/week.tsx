import type { ManualActivity, PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { clockTime, shortDate, weekday } from '../format'

const ACTIVITY: Readonly<Record<ManualActivity, string>> = { practice: 'practice', game: 'game', gym: 'gym', pt: 'clinic visit', walking: 'walking', rest: 'rest' }

/** The last seven days as a table, newest first, with the same week summary the patient's PT report uses. */
export function WeekSection({ patient }: { readonly patient: PatientSummary }) {
  const { summary, headline } = patient.week
  const days = [...patient.ring.days].reverse()
  const last = patient.ring.days.at(-1)?.date
  return (
    <section className="card" aria-labelledby="week-title">
      <header className="card-head">
        <h2 id="week-title">{copy.weekTitle}</h2>
        <span className="small muted">{copy.weekRange(shortDate(summary.weekStart), shortDate(summary.weekEnd))}</span>
      </header>
      <div className="card-body stack">
        <p>{headline}</p>
        <dl className="facts">
          <div className="fact"><dt>{copy.peakBend}</dt><dd>{summary.peakFlexionDeg !== undefined ? `${summary.peakFlexionDeg}°` : '–'}</dd></div>
          <div className="fact"><dt>{copy.bestStraight}</dt><dd>{summary.bestExtensionDeficitDeg === undefined ? '–' : summary.bestExtensionDeficitDeg <= 0 ? copy.fullyStraight : copy.shortOf(summary.bestExtensionDeficitDeg)}</dd></div>
          <div className="fact"><dt>{copy.flareMornings}</dt><dd>{summary.flares.length}</dd></div>
          <div className="fact"><dt>{copy.painLogs}</dt><dd>{summary.painLogCount}</dd></div>
        </dl>
      </div>
      <table className="table days">
        <thead>
          <tr><th scope="col">{copy.colDay}</th><th scope="col">{copy.colMorning}</th><th scope="col" className="col-wide">{copy.colActivity}</th><th scope="col">{copy.colPain}</th></tr>
        </thead>
        <tbody>
          {days.map((d) => {
            const acts = [...(d.ptVisit ? ['clinic visit'] : []), ...d.activities.map((a) => ACTIVITY[a])]
            const entries = [
              ...d.pain.map((p) => (p.note ? `${clockTime(p.hour)} "${p.note}"` : copy.painEntry(clockTime(p.hour), p.pain, p.didNotSettle))),
              ...d.bends.map((b) => copy.bendEntry(clockTime(b.hour), b.angleDeg, b.limitDeg)),
            ]
            const morning = copy.morningWords(d.morning, d.checkInPain)
            return (
              <tr key={d.date}>
                <th scope="row" className="day-name">
                  {`${weekday(d.date)} ${shortDate(d.date)}`}
                  {d.date === last ? <span className="small muted">{` · ${copy.today}`}</span> : null}
                </th>
                <td>{d.morning === 'flare' ? <span className="tag tag-worth-a-look">{morning}</span> : d.morning === 'none' ? <span className="muted">{morning}</span> : morning}</td>
                <td className="col-wide">{acts.length ? acts.join(', ') : '–'}</td>
                <td>{entries.length ? entries.join('; ') : '–'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
