import { addDays, startOfDay } from '../time/day'
import { MANUAL_INSIGHTS, STATUS_RULES } from './constants'
import { flareUps, insightsFor } from './insights'
import type { InsightCandidate } from './insights'
import { baselineScore, loadsFor } from './load'
import { statusFor } from './status'
import type { StatusResult } from './status'
import { suggestionFor } from './suggestion'
import { milestones, progressPercent } from './trend'
import type { Milestone } from './trend'
import type { Dataset, DayLoad, FlareDay, PainLog, RomDay } from './types'
import { weeksSince } from '../time/day'

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
    insights: insightsFor({ flares, logs: data.activityLogs, loads, dates: window, baselineScore: baseline }),
    milestones: milestones(data.romDays),
  }
}
