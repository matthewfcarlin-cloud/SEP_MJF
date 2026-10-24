import { addDays } from '../time/day'
import type { ActivityLog, Dataset, DayLoad, FlareDay, ManualActivity, RomDay } from '../manual/types'
import { DISCLAIMER } from '../copy/disclaimer'
import { flareUps } from '../manual/insights'
import { loadsFor } from '../manual/load'
import { STATUS_RULES } from '../manual/constants'

export type MorningMark = 'clear' | 'some' | 'flare' | 'none'

export interface DayRow {
  readonly load: DayLoad
  /** How the next morning read: clear (pain < 3, no swelling), some, flare-up, or no check-in. */
  readonly morning: MorningMark
  readonly activities: readonly ManualActivity[]
}

export interface WeeklySummary {
  readonly weekStart: string
  readonly weekEnd: string
  readonly days: readonly DayLoad[]
  readonly rows: readonly DayRow[]
  readonly avgScore: number
  readonly flares: readonly FlareDay[]
  readonly activityCounts: Readonly<Partial<Record<ManualActivity, number>>>
  readonly bestExtensionDeficitDeg: number | undefined
  readonly peakFlexionDeg: number | undefined
  readonly painLogCount: number
}

export interface WeekChange {
  readonly avgScoreDelta: number
  readonly flexionDeltaDeg: number | undefined
  readonly extensionDeltaDeg: number | undefined
  readonly flareDelta: number
}

const inWeek = (date: string, start: string, end: string): boolean => date >= start && date <= end

const countActivities = (logs: readonly ActivityLog[]): WeeklySummary['activityCounts'] =>
  logs.reduce<Partial<Record<ManualActivity, number>>>(
    (acc, l) => ({ ...acc, [l.activity]: (acc[l.activity] ?? 0) + 1 }),
    {},
  )

const minBy = (xs: readonly RomDay[], f: (d: RomDay) => number): number | undefined =>
  xs.length === 0 ? undefined : Math.min(...xs.map(f))
const maxBy = (xs: readonly RomDay[], f: (d: RomDay) => number): number | undefined =>
  xs.length === 0 ? undefined : Math.max(...xs.map(f))

const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length

function morningMark(data: Dataset, date: string, flareDates: ReadonlySet<string>): MorningMark {
  if (flareDates.has(date)) return 'flare'
  const checkIn = data.checkIns.find((c) => c.date === date)
  if (!checkIn) return 'none'
  if (checkIn.pain >= STATUS_RULES.steadyPain || checkIn.swelling !== 'none') return 'some'
  return 'clear'
}

/** The seven days ending on weekEnd. Pure data; the screen renders it. */
export function weeklySummary(data: Dataset, weekEnd: string): WeeklySummary {
  const weekStart = addDays(weekEnd, -6)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const logs = data.activityLogs.filter((l) => inWeek(l.date, weekStart, weekEnd))
  const rom = data.romDays.filter((d) => inWeek(d.date, weekStart, weekEnd))
  const days = loadsFor(dates, data.activityLogs)
  const allFlares = flareUps(data.checkIns, data.painLogs)
  const flares = allFlares.filter((f) => inWeek(f.date, weekStart, weekEnd))
  const allFlareDates = new Set(allFlares.map((f) => f.date))
  return {
    weekStart,
    weekEnd,
    days,
    rows: days.map((load) => ({
      load,
      // The morning after the day's load, which is how the pain-monitoring rule reads a day.
      morning: morningMark(data, addDays(load.date, 1), allFlareDates),
      activities: logs.filter((l) => l.date === load.date).map((l) => l.activity),
    })),
    avgScore: Math.round(mean(days.map((d) => d.score))),
    flares,
    activityCounts: countActivities(logs),
    bestExtensionDeficitDeg: minBy(rom, (d) => d.extensionDeficitDeg),
    peakFlexionDeg: maxBy(rom, (d) => d.flexionDeg),
    painLogCount: data.painLogs.filter((p) => inWeek(p.date, weekStart, weekEnd)).length,
  }
}

const delta = (a: number | undefined, b: number | undefined): number | undefined =>
  a === undefined || b === undefined ? undefined : Math.round(a - b)

/** This week against the week before it. Positive flexion and load deltas mean more; a negative extension delta means straighter. */
export function weekChange(data: Dataset, weekEnd: string): WeekChange {
  const now = weeklySummary(data, weekEnd)
  const prev = weeklySummary(data, addDays(weekEnd, -7))
  return {
    avgScoreDelta: now.avgScore - prev.avgScore,
    flexionDeltaDeg: delta(now.peakFlexionDeg, prev.peakFlexionDeg),
    extensionDeltaDeg: delta(now.bestExtensionDeficitDeg, prev.bestExtensionDeficitDeg),
    flareDelta: now.flares.length - prev.flares.length,
  }
}

const flareWords = (n: number): string => (n === 0 ? 'no flare-up mornings' : n === 1 ? 'one flare-up morning' : `${n} flare-up mornings`)

/** One sentence for the top of the report. Observations only. */
export function weekHeadline(summary: WeeklySummary, change: WeekChange): string {
  const load =
    change.avgScoreDelta > 5 ? 'a heavier week than last' : change.avgScoreDelta < -5 ? 'a lighter week than last' : 'a week like the last one'
  const range =
    summary.bestExtensionDeficitDeg !== undefined && summary.bestExtensionDeficitDeg <= 2
      ? 'the knee straightened fully'
      : summary.bestExtensionDeficitDeg !== undefined
        ? `straightening ${summary.bestExtensionDeficitDeg}° short`
        : 'no range data'
  const bend =
    change.flexionDeltaDeg !== undefined && change.flexionDeltaDeg > 0
      ? `, bend up ${change.flexionDeltaDeg}°`
      : change.flexionDeltaDeg !== undefined && change.flexionDeltaDeg < 0
        ? `, bend down ${Math.abs(change.flexionDeltaDeg)}°`
        : ''
  return `${capitalise(load)}, ${flareWords(summary.flares.length)}, ${range}${bend}.`
}

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

const ACTIVITY_LABEL: Record<ManualActivity, string> = {
  practice: 'practice',
  game: 'game',
  gym: 'gym',
  pt: 'PT',
  walking: 'walking',
  rest: 'rest',
}

const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? '' : 's'}`

/** Body of the share text without the disclaimer, so copy checks can run on it. */
export function shareBody(summary: WeeklySummary, athleteName: string): string {
  const avg = summary.avgScore
  const sessions = Object.entries(summary.activityCounts)
    .filter(([a]) => a !== 'rest' && a !== 'walking')
    .map(([a, n]) => `${n} ${ACTIVITY_LABEL[a as ManualActivity]}`)
    .join(', ')
  const rom =
    summary.bestExtensionDeficitDeg !== undefined && summary.peakFlexionDeg !== undefined
      ? `Best straightening ${summary.bestExtensionDeficitDeg}° short of full, deepest bend ${summary.peakFlexionDeg}° (via Kinn tape, sample data).`
      : 'No range-of-motion data this week.'
  return [
    `Kinn weekly summary for ${athleteName}, ${summary.weekStart} to ${summary.weekEnd}.`,
    `Average daily knee load ${avg} of 100. Sessions recorded: ${sessions || 'none'}.`,
    `${plural(summary.flares.length, 'flare-up morning')}${summary.flares.length ? ` (${summary.flares.map((f) => f.date).join(', ')})` : ''}. ${plural(summary.painLogCount, 'pain log')}.`,
    rom,
  ].join('\n')
}

/** Plain-text version of the summary for the share sheet. Sessions recorded, never sessions missed. */
export const shareText = (summary: WeeklySummary, athleteName: string): string =>
  `${shareBody(summary, athleteName)}\n${DISCLAIMER}`
