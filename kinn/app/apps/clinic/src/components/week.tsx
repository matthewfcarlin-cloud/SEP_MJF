import type { ManualActivity, PatientSummary } from '@reco/core'

import { copy } from '../copy'
import { SeverityMark } from './severity'
import { clockTime, shortDate, weekday } from '../format'

const ACTIVITY: Readonly<Record<ManualActivity, string>> = { practice: 'practice', game: 'game', gym: 'gym', pt: 'clinic visit', walking: 'walking', rest: 'rest' }

/** The ring as a table, day by day, with the same week summary the patient's PT report uses. */
export function WeekSection({ patient }: { readonly patient: PatientSummary }) {
  const { summary, headline } = patient.week
  const days = [...patient.ring.days].reverse()
  const last = patient.ring.days.at(-1)?.date
  return (
    <section className="panel" aria-labelledby="week-title">
      <div className="week-head">
        <h2 id="week-title">{copy.weekTitle}</h2>
        <span className="small muted">{copy.weekSummaryRange(shortDate(summary.weekStart), shortDate(summary.weekEnd))}</span>
      </div>
      <p className="headline">{headline}</p>
      <dl className="facts facts-week">
        <dt>{copy.peakBend}</dt><dd className="num">{summary.peakFlexionDeg !== undefined ? `${summary.peakFlexionDeg}°` : '–'}</dd>
        <dt>{copy.bestStraight}</dt>{summary.bestExtensionDeficitDeg === undefined ? <dd>–</dd> : summary.bestExtensionDeficitDeg <= 0 ? <dd>{copy.fullyStraight}</dd> : <dd className="num">{copy.shortOf(summary.bestExtensionDeficitDeg)}</dd>}
        <dt>{copy.flareMornings}</dt><dd className="num">{summary.flares.length}</dd>
        <dt>{copy.painLogs}</dt><dd className="num">{summary.painLogCount}</dd>
      </dl>
      <table className="days">
        <colgroup><col className="w-day" /><col className="w-morning" /><col className="col-activity w-activity" /><col /></colgroup>
        <thead>
          <tr><th scope="col">{copy.colDay}</th><th scope="col">{copy.colMorning}</th><th scope="col" className="col-activity">{copy.colActivity}</th><th scope="col">{copy.colPain}</th></tr>
        </thead>
        <tbody>
          {days.map((d) => {
            const acts = [...(d.ptVisit ? ['clinic visit'] : []), ...d.activities.map((a) => ACTIVITY[a])]
            const entries = [
              ...d.pain.map((p) => (p.note ? `${clockTime(p.hour)} "${p.note}"` : copy.painEntry(clockTime(p.hour), p.pain, p.didNotSettle))),
              ...d.bends.map((b) => copy.bendEntry(clockTime(b.hour), b.angleDeg, b.limitDeg)),
            ]
            return (
              <tr key={d.date} className={d.date === last ? 'today' : undefined}>
                <td>{`${weekday(d.date)} ${shortDate(d.date)}`}</td>
                <td><span className="day-morning">{d.morning === 'flare' ? <SeverityMark tier="contact-soon" size={11} /> : d.morning === 'some' ? <SeverityMark tier="worth-a-look" size={11} /> : <i className={`dot dot-${d.morning}`} aria-hidden="true" />}{copy.morningWords(d.morning, d.checkInPain)}</span></td>
                <td className="col-activity">{acts.length ? acts.join(', ') : '–'}</td>
                <td>{entries.length ? entries.join('; ') : '–'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
