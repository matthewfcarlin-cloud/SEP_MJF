import { addDays, startOfDay } from '../time/day'
import { MANUAL_INSIGHTS, STATUS_RULES } from './constants'
import { flareUps, insightsFor, loadContrast } from './insights'
import type { InsightCandidate, LoadContrast } from './insights'
import { baselineScore, loadsFor } from './load'
import { statusFor } from './status'
import type { StatusResult } from './status'
import { suggestionFor } from './suggestion'
import { milestones, progressPercent } from './trend'
import type { Milestone } from './trend'
import type { Dataset, DayLoad, FlareDay, ManualActivity, PainLog, RomDay } from './types'
import { weeksSince } from '../time/day'

export type TimelineMark = 'flare' | 'before-flare' | 'matched' | 'none'

/** One day on the 30-day insight timeline. */
export interface TimelineDay {
  readonly date: string
  readonly score: number
  /** flare: a flare-up morning. before-flare: the day before one. matched: the top insight's condition held that day. */
  readonly mark: TimelineMark
  readonly activities: readonly ManualActivity[]
}

export interface TodayView {
  readonly date: string
  readonly status: StatusResult
  readonly suggestion: string
  readonly progressPercent: number
  readonly latestRom: RomDay | undefined
  readonly todayLoad: DayLoad
  readonly yesterdayLoad: DayLoad
  readonly baselineScore: number
  readonly checkInDone: boolean
  /** Pain logs from yesterday still waiting for a "Did it settle?" answer. */
  readonly pendingSettle: readonly PainLog[]
  readonly loads: readonly DayLoad[]
  readonly flares: readonly FlareDay[]
  readonly weeksSinceInjury: number
  readonly insights: readonly InsightCandidate[]
  readonly loadContrast: LoadContrast | undefined
  readonly timeline: readonly TimelineDay[]
  readonly milestones: readonly Milestone[]
}

/** Date keys from `days` before today through today, oldest first. */
export function dateRange(today: string, days: number): readonly string[] {
  return Array.from({ length: days + 1 }, (_, i) => addDays(today, i - days))
}

const latestRomDay = (days: readonly RomDay[]): RomDay | undefined =>
  [...days].sort((a, b) => a.date.localeCompare(b.date)).at(-1)

/** Everything the Today, Insights and Progress screens need, derived in one pure call. */
export function deriveToday(data: Dataset, today: string): TodayView {
  const yesterday = addDays(today, -1)
  const window = dateRange(today, MANUAL_INSIGHTS.windowDays)
  const loads = loadsFor(window, data.activityLogs)
  const baselineWindow = loads.filter((l) => l.date < yesterday).slice(-STATUS_RULES.baselineDays)
  const baseline = baselineScore(baselineWindow)
  const todayLoad = loads.at(-1) ?? { date: today, units: 0, score: 0 }
  const yesterdayLoad = loads.at(-2) ?? { date: yesterday, units: 0, score: 0 }
  const checkIn = data.checkIns.find((c) => c.date === today)
  const yesterdaysPain = data.painLogs.filter((p) => p.date === yesterday)
  const status = statusFor({
    checkIn,
    yesterdayScore: yesterdayLoad.score,
    baselineScore: baseline,
    unsettledPain: yesterdaysPain.some((p) => p.settled === 'no'),
  })
  const flares = flareUps(data.checkIns, data.painLogs).filter((f) => f.date >= window[0]! && f.date <= today)
  const latestRom = latestRomDay(data.romDays)
  const insightInput = { flares, logs: data.activityLogs, loads, dates: window, baselineScore: baseline }
  const insights = insightsFor(insightInput)
  const timeline = buildTimeline(window, loads, flares, data, insights[0]?.id)
  const weeks = Math.max(0, weeksSince(data.profile.injuryDate, startOfDay(today, 12)))
  return {
    date: today,
    status,
    suggestion: suggestionFor(status),
    progressPercent: progressPercent(latestRom, weeks),
    weeksSinceInjury: weeks,
    latestRom,
    todayLoad,
    yesterdayLoad,
    baselineScore: baseline,
    checkInDone: checkIn !== undefined,
    pendingSettle: yesterdaysPain.filter((p) => p.settled === undefined),
    loads,
    flares,
    insights,
    loadContrast: loadContrast(insightInput),
    timeline,
    milestones: milestones(data.romDays),
  }
}

const CONDITION_ACTIVITY: Readonly<Record<string, ManualActivity>> = {
  'after-game': 'game',
  'after-practice': 'practice',
  'after-gym': 'gym',
  'after-pt': 'pt',
}

/** Marks each day of the window so the screen can draw the pattern instead of only saying it. */
function buildTimeline(
  dates: readonly string[],
  loads: readonly DayLoad[],
  flares: readonly FlareDay[],
  data: Dataset,
  topInsightId: string | undefined,
): readonly TimelineDay[] {
  const flareDates = new Set(flares.map((f) => f.date))
  const beforeFlare = new Set(flares.map((f) => addDays(f.date, -1)))
  const matchedActivity = topInsightId ? CONDITION_ACTIVITY[topInsightId] : undefined
  return dates.map((date) => {
    const activities = data.activityLogs.filter((l) => l.date === date).map((l) => l.activity)
    const mark: TimelineMark = flareDates.has(date)
      ? 'flare'
      : beforeFlare.has(date)
        ? 'before-flare'
        : matchedActivity && activities.includes(matchedActivity)
          ? 'matched'
          : 'none'
    return { date, score: loads.find((l) => l.date === date)?.score ?? 0, mark, activities }
  })
}
