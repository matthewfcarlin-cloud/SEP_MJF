import { addDays } from '../time/day'
import type { ActivityLog, Dataset, DayLoad, FlareDay, ManualActivity, RomDay } from '../manual/types'
import { DISCLAIMER } from '../copy/disclaimer'
import { flareUps } from '../manual/insights'
import { loadsFor } from '../manual/load'

export interface WeeklySummary {
  readonly weekStart: string
  readonly weekEnd: string
  readonly days: readonly DayLoad[]
  readonly flares: readonly FlareDay[]
  readonly activityCounts: Readonly<Partial<Record<ManualActivity, number>>>
  readonly bestExtensionDeficitDeg: number | undefined
  readonly peakFlexionDeg: number | undefined
  readonly painLogCount: number
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

/** The seven days ending on weekEnd. Pure data; the screen renders it. */
export function weeklySummary(data: Dataset, weekEnd: string): WeeklySummary {
  const weekStart = addDays(weekEnd, -6)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const logs = data.activityLogs.filter((l) => inWeek(l.date, weekStart, weekEnd))
  const rom = data.romDays.filter((d) => inWeek(d.date, weekStart, weekEnd))
  return {
    weekStart,
    weekEnd,
    days: loadsFor(dates, data.activityLogs),
    flares: flareUps(data.checkIns, data.painLogs).filter((f) => inWeek(f.date, weekStart, weekEnd)),
    activityCounts: countActivities(logs),
    bestExtensionDeficitDeg: minBy(rom, (d) => d.extensionDeficitDeg),
    peakFlexionDeg: maxBy(rom, (d) => d.flexionDeg),
    painLogCount: data.painLogs.filter((p) => inWeek(p.date, weekStart, weekEnd)).length,
  }
}

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
  const scores = summary.days.map((d) => d.score)
  const avg = Math.round(scores.reduce((s, x) => s + x, 0) / Math.max(1, scores.length))
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
