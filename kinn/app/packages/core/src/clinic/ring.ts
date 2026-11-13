/**
 * The patient's last seven days, laid out for the clinician view's Week Ring: one day per
 * sector, entries at the hour they happened where the record has one. Morning check-ins sit in
 * the morning, activities across the day (the log has the day, not the hour), pain logs and
 * bend alerts at their exact time. PT visits are the activity logged as "pt".
 */
import { addDays } from '../time/day'
import { flareUps } from '../manual/insights'
import { morningMark } from '../report/weekly'
import type { MorningMark } from '../report/weekly'
import type { Dataset, ManualActivity } from '../manual/types'
import { hasRedFlagWords } from '../warnings/line'

export const RING_DAYS = 7
export const HOURS_PER_DAY = 24
export const WEEK_HOURS = RING_DAYS * HOURS_PER_DAY
/** A clinic visit is counted as one hour; RECO doesn't record visit length. */
export const VISIT_HOURS = 1

export interface RingPain {
  readonly id: string
  /** Hour of day, fractional (19.5 = 19:30). */
  readonly hour: number
  readonly pain: number | undefined
  readonly note: string | undefined
  readonly didNotSettle: boolean
  readonly redFlag: boolean
}

export interface RingBend {
  readonly hour: number
  readonly angleDeg: number
  readonly limitDeg: number
}

export interface RingDay {
  readonly date: string
  readonly morning: MorningMark
  readonly checkInPain: number | undefined
  readonly activities: readonly ManualActivity[]
  readonly ptVisit: boolean
  readonly pain: readonly RingPain[]
  readonly bends: readonly RingBend[]
}

export interface WeekRing {
  /** Oldest first; the last day is today. */
  readonly days: readonly RingDay[]
  readonly visits: number
  readonly hoursInClinic: number
  readonly hoursBetween: number
  readonly checkIns: number
  readonly painLogs: number
  readonly bendAlerts: number
}

const hourOf = (t: number): number => {
  const d = new Date(t)
  return d.getHours() + d.getMinutes() / 60
}

export function weekRing(data: Dataset, today: string): WeekRing {
  const dates = Array.from({ length: RING_DAYS }, (_, i) => addDays(today, i - (RING_DAYS - 1)))
  const flareDates = new Set(flareUps(data.checkIns, data.painLogs).map((f) => f.date))
  const days = dates.map((date): RingDay => {
    const activities = data.activityLogs.filter((l) => l.date === date).map((l) => l.activity)
    return {
      date,
      morning: morningMark(data, date, flareDates),
      checkInPain: data.checkIns.find((c) => c.date === date)?.pain,
      activities: activities.filter((a) => a !== 'pt'),
      ptVisit: activities.includes('pt'),
      pain: data.painLogs.filter((p) => p.date === date).map((p) => ({
        id: p.id,
        hour: hourOf(p.t),
        pain: p.pain,
        note: p.note,
        didNotSettle: p.settled === 'no',
        redFlag: p.note !== undefined && hasRedFlagWords(p.note),
      })),
      bends: (data.bendAlerts ?? []).filter((a) => a.date === date).map((a) => ({ hour: hourOf(a.t), angleDeg: a.angleDeg, limitDeg: a.limitDeg })),
    }
  })
  const visits = days.filter((d) => d.ptVisit).length
  const hoursInClinic = visits * VISIT_HOURS
  return {
    days,
    visits,
    hoursInClinic,
    hoursBetween: WEEK_HOURS - hoursInClinic,
    checkIns: days.filter((d) => d.checkInPain !== undefined).length,
    painLogs: days.reduce((n, d) => n + d.pain.length, 0),
    bendAlerts: days.reduce((n, d) => n + d.bends.length, 0),
  }
}

export interface RingHours {
  /** Hours of the seven days that have passed, up to now. */
  readonly elapsed: number
  readonly inClinic: number
  /** The hours the PT never sees: elapsed hours minus clinic hours. */
  readonly unseen: number
}

/** The ring's centre numbers, counted only up to now so they match the arc. */
export function ringHours(ring: WeekRing, nowHour: number): RingHours {
  const elapsed = Math.floor((RING_DAYS - 1) * HOURS_PER_DAY + Math.min(HOURS_PER_DAY, Math.max(0, nowHour)))
  return { elapsed, inClinic: ring.hoursInClinic, unseen: Math.max(0, elapsed - ring.hoursInClinic) }
}
