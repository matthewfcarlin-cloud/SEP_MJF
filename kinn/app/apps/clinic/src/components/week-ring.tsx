import { HOURS_PER_DAY, RING_DAYS, ringHours } from '@reco/core'
import type { RingDay, WeekRing as WeekRingData } from '@reco/core'
import { useEffect, useRef } from 'react'

import { copy } from '../copy'
import { weekday } from '../format'
import { angleOf, arcPath, polar, wedgePath, weekHour } from './polar'

const VIEW = 700
const C = VIEW / 2
const R = { label: 330, tickOut: 300, tickIn: 292, arc: 272, morning: 238, pain: 204, activity: 170, hub: 140 } as const
const ARC_STROKE = 22
const ACTIVITY_STROKE = 10
const DAY_HOURS = { activityFrom: 9, activityTo: 20, morning: 8, visit: 12 } as const
/** The refill on patient change: short, because switching patients happens many times a day. */
const REFILL_MS = 280

interface WeekRingProps {
  readonly ring: WeekRingData
  /** The hour of today that has passed, so the arc stops at now. */
  readonly nowHour: number
  readonly selectedDay: number
  readonly onSelectDay: (index: number) => void
  /** Refill the arc clockwise from 12; false for keyboard switches and reduced motion. */
  readonly animate: boolean
  readonly patientId: string
}

function Ticks() {
  return (
    <g>
      {Array.from({ length: RING_DAYS * HOURS_PER_DAY }, (_, h) => {
        const isSix = h % 6 === 0
        const a = polar(C, C, isSix ? R.tickOut + 4 : R.tickOut, angleOf(h))
        const b = polar(C, C, R.tickIn, angleOf(h))
        return <line key={h} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`ring-tick${isSix ? ' six' : ''}`} strokeWidth={isSix ? 1.5 : 1} />
      })}
    </g>
  )
}

/** The severity family from the flags, drawn on the ring: diamonds for anything worth a look or more. */
function Diamond({ x, y, r, half, className }: { readonly x: number; readonly y: number; readonly r: number; readonly half: boolean; readonly className: string }) {
  const outline = `M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`
  if (!half) return <path d={outline} className={className} />
  return (
    <g className={className}>
      <path d={outline} className="d-outline" />
      <path d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} Z`} />
    </g>
  )
}

function MorningMark({ x, y, mark }: { readonly x: number; readonly y: number; readonly mark: RingDay['morning'] }) {
  if (mark === 'flare') return <Diamond x={x} y={y} r={11} half={false} className="m-flare" />
  if (mark === 'some') return <Diamond x={x} y={y} r={11} half className="m-some" />
  return <circle cx={x} cy={y} r={8} className={`m-${mark}`} />
}

function PainMark({ x, y, pain }: { readonly x: number; readonly y: number; readonly pain: RingDay['pain'][number] }) {
  if (pain.redFlag) {
    return (
      <g>
        <circle cx={x} cy={y} r={16} className="p-halo" />
        <Diamond x={x} y={y} r={10} half={false} className="p-red" />
      </g>
    )
  }
  if (pain.didNotSettle) return <Diamond x={x} y={y} r={9} half className="p-unsettled" />
  return <circle cx={x} cy={y} r={(pain.pain ?? 0) >= 8 ? 9 : 6.5} className="p-dot" />
}

function DayMarks({ day, index }: { readonly day: RingDay; readonly index: number }) {
  const at = (r: number, hour: number) => polar(C, C, r, angleOf(weekHour(index, hour)))
  const morning = at(R.morning, DAY_HOURS.morning)
  const visit = angleOf(weekHour(index, DAY_HOURS.visit))
  return (
    <g>
      {day.activities.length > 0 ? (
        <path d={arcPath(C, C, R.activity, angleOf(weekHour(index, DAY_HOURS.activityFrom)), angleOf(weekHour(index, DAY_HOURS.activityTo)))} className="ring-activity" strokeWidth={ACTIVITY_STROKE} strokeLinecap="round" fill="none" />
      ) : null}
      {day.ptVisit ? <path d={arcPath(C, C, R.arc, visit - 1.07, visit + 1.07)} className="ring-visit" strokeWidth={ARC_STROKE + 6} fill="none" /> : null}
      <MorningMark x={morning.x} y={morning.y} mark={day.morning} />
      {day.pain.map((p) => {
        const pt = at(R.pain, p.hour)
        return <PainMark key={p.id} x={pt.x} y={pt.y} pain={p} />
      })}
      {day.bends.map((b, i) => {
        const pt = at(R.arc, b.hour)
        return <rect key={i} x={pt.x - 5} y={pt.y - 5} width={10} height={10} rx={2} className="ring-bend" transform={`rotate(${angleOf(weekHour(index, b.hour))} ${pt.x} ${pt.y})`} />
      })}
    </g>
  )
}

/**
 * The patient's week as one ring. Marks are read per day: a day holds up to a dozen small marks,
 * so the seven day sectors are the hover and keyboard targets, and the readout lists every mark.
 * Seven day sectors run clockwise from 12 o'clock, 168 hour
 * ticks around the edge. From outside in: the week so far (teal, with clinic visits in ink and
 * bends past the limit in amber), morning check-ins, pain logs at their hour, and activity.
 */
export function WeekRing({ ring, nowHour, selectedDay, onSelectDay, animate, patientId }: WeekRingProps) {
  const arcRef = useRef<SVGPathElement>(null)
  const elapsed = angleOf(weekHour(RING_DAYS - 1, nowHour))
  const hours = ringHours(ring, nowHour)

  useEffect(() => {
    const el = arcRef.current
    if (!el || !animate || typeof el.animate !== 'function') return
    const length = el.getTotalLength()
    const run = el.animate([{ strokeDasharray: `0 ${length}` }, { strokeDasharray: `${length} ${length}` }], { duration: REFILL_MS, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' })
    return () => run.cancel()
  }, [patientId, animate])

  const onKey = (e: React.KeyboardEvent, index: number) => {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? index + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? index - 1 : null
    if (next === null) return
    e.preventDefault()
    const clamped = Math.max(0, Math.min(RING_DAYS - 1, next))
    onSelectDay(clamped)
    const target = e.currentTarget.parentElement?.querySelectorAll<SVGPathElement>('.ring-sector')[clamped]
    target?.focus()
  }

  return (
    <div className="ring-wrap">
      <svg className="ring-svg" viewBox={`0 0 ${VIEW} ${VIEW}`} role="group" aria-label={copy.ringLabel(hours.unseen, hours.inClinic)}>
        <g>
          {ring.days.map((day, i) => {
            const from = angleOf(weekHour(i, 0))
            const to = angleOf(weekHour(i + 1, 0))
            return (
              <path
                key={day.date}
                d={wedgePath(C, C, R.hub, R.tickIn, from + 0.3, to - 0.3)}
                className={`ring-sector${i === selectedDay ? ' on' : ''}`}
                tabIndex={i === selectedDay ? 0 : -1}
                role="button"
                aria-pressed={i === selectedDay}
                aria-label={copy.dayLabel(weekday(day.date), day.date)}
                onMouseEnter={() => onSelectDay(i)}
                onFocus={() => onSelectDay(i)}
                onClick={() => onSelectDay(i)}
                onKeyDown={(e) => onKey(e, i)}
              />
            )
          })}
        </g>
        <circle cx={C} cy={C} r={R.arc} className="ring-track" strokeWidth={ARC_STROKE} fill="none" />
        <path ref={arcRef} d={arcPath(C, C, R.arc, 0, Math.max(0.5, elapsed))} className="ring-arc" strokeWidth={ARC_STROKE} fill="none" />
        <Ticks />
        {ring.days.map((day, i) => {
          const sep = angleOf(weekHour(i, 0))
          const a = polar(C, C, R.hub, sep)
          const b = polar(C, C, R.tickOut + 4, sep)
          return (
            <g key={day.date} pointerEvents="none">
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="ring-sep" strokeWidth={2} />
              <DayMarks day={day} index={i} />
            </g>
          )
        })}
      </svg>
      {ring.days.map((day, i) => {
        const label = polar(C, C, R.label, angleOf(weekHour(i, HOURS_PER_DAY / 2)))
        return (
          <span key={day.date} className={`ring-day-label${i === RING_DAYS - 1 ? ' today' : ''}`} style={{ left: `${(label.x / VIEW) * 100}%`, top: `${(label.y / VIEW) * 100}%` }} aria-hidden="true">
            {weekday(day.date).toUpperCase()}
          </span>
        )
      })}
      <div className="ring-center">
        <span className="ring-unseen">{hours.unseen}<span className="ring-unit"> h</span></span>
        <span className="ring-unseen-label">{copy.unseenLabel}</span>
        <span className="ring-seen"><b>{`${hours.inClinic} h`}</b>{` ${copy.inClinic}`}</span>
      </div>
    </div>
  )
}
