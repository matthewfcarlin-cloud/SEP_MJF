import type { RingDay, WeekRing as WeekRingData } from '@reco/core'

import { copy } from '../copy'
import { clockTime, shortDate, weekday } from '../format'
import { WeekRing } from './week-ring'

const ACTIVITY: Readonly<Record<string, string>> = { practice: 'practice', game: 'game', gym: 'gym', walking: 'walking', rest: 'rest' }

/** What the hovered or focused day holds, read out beside the ring: the ring's proof. */
function Readout({ day }: { readonly day: RingDay }) {
  const activity = [day.ptVisit ? copy.visitDay : null, ...day.activities.map((a) => ACTIVITY[a] ?? a)].filter((x): x is string => x !== null)
  const tape = day.bends.map((b) => copy.bendEntry(clockTime(b.hour), b.angleDeg, b.limitDeg))
  const pain = day.pain.map((p) => (p.note ? `${clockTime(p.hour)} "${p.note}"` : copy.painEntry(clockTime(p.hour), p.pain, p.didNotSettle)))
  return (
    <dl className="readout" aria-live="polite">
      <dt>{copy.readoutDay}</dt>
      <dd className="num">{`${weekday(day.date)} ${shortDate(day.date)}`}</dd>
      <dt>{copy.readoutMorning}</dt>
      <dd>{copy.morningWords(day.morning, day.checkInPain)}</dd>
      <dt>{copy.readoutActivity}</dt>
      <dd>{activity.length ? activity.join(', ') : copy.nothingLoggedDay}</dd>
      <dt>{copy.readoutPain}</dt>
      <dd>{pain.length ? pain.join('; ') : copy.noPainLogs}</dd>
      {tape.length ? (
        <>
          <dt>{copy.readoutTape}</dt>
          <dd>{tape.join('; ')}</dd>
        </>
      ) : null}
    </dl>
  )
}

const DIAMOND = 'M 7 1 L 13 7 L 7 13 L 1 7 Z'
const HALF = 'M 7 1 L 13 7 L 7 13 Z'

function Key({ children, label }: { readonly children: React.ReactNode; readonly label: string }) {
  return (
    <span>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">{children}</svg>
      {label}
    </span>
  )
}

/** Every mark the ring can draw, grouped by track, so nothing on the ring goes unexplained. */
function Legend() {
  return (
    <div className="legend-wrap">
      <div className="legend">
        <span className="legend-title">{copy.legendMorningsTitle}</span>
        <span className="legend-items">
        <Key label={copy.legendClear}><circle cx="7" cy="7" r="5" fill="var(--teal)" /></Key>
        <Key label={copy.legendSome}><path d={DIAMOND} fill="none" stroke="var(--amber)" strokeWidth="1.5" /><path d={HALF} fill="var(--amber)" /></Key>
        <Key label={copy.legendFlare}><path d={DIAMOND} fill="var(--red)" /></Key>
        <Key label={copy.legendNone}><circle cx="7" cy="7" r="4.5" fill="none" stroke="var(--r4)" strokeWidth="2" /></Key>
        </span>
      </div>
      <div className="legend">
        <span className="legend-title">{copy.legendPainTitle}</span>
        <span className="legend-items">
        <Key label={copy.legendPain}><circle cx="7" cy="7" r="4.5" fill="var(--r7)" /></Key>
        <Key label={copy.legendUnsettled}><path d={DIAMOND} fill="none" stroke="var(--amber)" strokeWidth="1.5" /><path d={HALF} fill="var(--amber)" /></Key>
        <Key label={copy.legendRedFlag}><circle cx="7" cy="7" r="6" fill="none" stroke="var(--red)" strokeWidth="1.2" /><path d="M 7 3 L 11 7 L 7 11 L 3 7 Z" fill="var(--red)" /></Key>
        </span>
      </div>
      <div className="legend">
        <span className="legend-title">{copy.legendDayTitle}</span>
        <span className="legend-items">
        <Key label={copy.legendVisit}><rect x="1" y="4" width="12" height="6" rx="1" fill="var(--r10)" /></Key>
        <Key label={copy.legendActivity}><rect x="1" y="4" width="12" height="6" rx="3" fill="var(--teal-soft)" /></Key>
        <Key label={copy.legendBend}><rect x="2" y="2" width="10" height="10" rx="2" fill="var(--amber)" /></Key>
        </span>
      </div>
      <p className="small muted">{copy.legendNote}</p>
    </div>
  )
}

interface RingPanelProps {
  readonly ring: WeekRingData
  readonly nowHour: number
  readonly selectedDay: number
  readonly onSelectDay: (index: number) => void
  readonly animate: boolean
  readonly patientId: string
}

export function RingPanel(props: RingPanelProps) {
  const day = props.ring.days[props.selectedDay] ?? props.ring.days.at(-1)
  return (
    <section className="panel ring-panel" aria-labelledby="ring-title">
      <h2 id="ring-title">{copy.ringTitle}</h2>
      <WeekRing {...props} />
      {day ? <Readout day={day} /> : null}
      <Legend />
    </section>
  )
}
