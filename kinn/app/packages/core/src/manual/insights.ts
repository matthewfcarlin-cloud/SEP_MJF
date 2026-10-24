import { addDays } from '../time/day'
import { MANUAL_INSIGHTS, STATUS_RULES } from './constants'
import type { ActivityLog, DayLoad, FlareDay, ManualActivity, MorningCheckIn, PainLog } from './types'

/**
 * A flare-up is a morning the knee was clearly worse: morning pain at or above
 * the flare threshold, swelling "a lot", or last night's pain that did not settle.
 * One per date.
 */
export function flareUps(checkIns: readonly MorningCheckIn[], painLogs: readonly PainLog[]): readonly FlareDay[] {
  const fromCheckIns: FlareDay[] = checkIns.flatMap((c): FlareDay[] => {
    if (c.pain >= STATUS_RULES.flarePain) return [{ date: c.date, reason: 'morning-pain' as const }]
    if (c.swelling === 'a-lot') return [{ date: c.date, reason: 'swelling' as const }]
    return []
  })
  const fromPain: FlareDay[] = painLogs
    .filter((p) => p.settled === 'no')
    .map((p) => ({ date: addDays(p.date, 1), reason: 'did-not-settle' as const }))
  const byDate = new Map<string, FlareDay>()
  for (const f of [...fromCheckIns, ...fromPain]) {
    if (!byDate.has(f.date)) byDate.set(f.date, f)
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export interface InsightCandidate {
  readonly id: string
  readonly text: string
  readonly support: number
  readonly prevalence: number
  readonly matching: number
  readonly total: number
}

interface Condition {
  readonly id: string
  readonly phrase: string
  readonly holdsOn: (date: string) => boolean
}

const ACTIVITY_PHRASE: Record<ManualActivity, string> = {
  game: 'game days',
  practice: 'practice days',
  gym: 'gym days',
  pt: 'PT days',
  walking: 'long walking days',
  rest: 'rest days',
}

const hasActivity = (logs: readonly ActivityLog[], date: string, activity: ManualActivity): boolean =>
  logs.some((l) => l.date === date && l.activity === activity)

function buildConditions(logs: readonly ActivityLog[], loads: readonly DayLoad[], baseline: number): readonly Condition[] {
  const scoreOn = (date: string): number => loads.find((l) => l.date === date)?.score ?? 0
  const activities: ManualActivity[] = ['game', 'practice', 'gym', 'pt']
  const activityConditions: Condition[] = activities.map((a) => ({
    id: `after-${a}`,
    phrase: `came after ${ACTIVITY_PHRASE[a]}`,
    holdsOn: (date) => hasActivity(logs, addDays(date, -1), a),
  }))
  return [
    ...activityConditions,
    {
      id: 'after-high-load',
      phrase: `came after days with a load over ${MANUAL_INSIGHTS.highLoadScore}`,
      holdsOn: (date) => scoreOn(addDays(date, -1)) > MANUAL_INSIGHTS.highLoadScore,
    },
    {
      id: 'after-spike',
      phrase: 'came after a day well above your usual',
      holdsOn: (date) => baseline > 0 && scoreOn(addDays(date, -1)) > STATUS_RULES.spikeRatio * baseline,
    },
  ]
}

const countWord = (n: number): string => (n === 1 ? 'one' : String(n))

function phrase(matching: number, total: number, conditionPhrase: string): string {
  if (matching === total) return `All ${countWord(total)} of your flare-ups ${conditionPhrase}.`
  return `${matching} of your last ${total} flare-ups ${conditionPhrase}.`
}

export interface InsightsInput {
  readonly flares: readonly FlareDay[]
  readonly logs: readonly ActivityLog[]
  readonly loads: readonly DayLoad[]
  /** All dates in the window, for prevalence. */
  readonly dates: readonly string[]
  readonly baselineScore: number
}

/**
 * Observations, never causes: a condition is shown when it held before most
 * flare-ups and on at most half of all days, so "after game days" is not shown
 * when every day was a game day.
 */
export function insightsFor(input: InsightsInput): readonly InsightCandidate[] {
  if (input.flares.length < MANUAL_INSIGHTS.minFlareUps) return []
  const total = input.flares.length
  const candidates = buildConditions(input.logs, input.loads, input.baselineScore).map((c) => {
    const matching = input.flares.filter((f) => c.holdsOn(f.date)).length
    const daysHeld = input.dates.filter(c.holdsOn).length
    const prevalence = input.dates.length === 0 ? 1 : daysHeld / input.dates.length
    return { id: c.id, text: phrase(matching, total, c.phrase), support: matching / total, prevalence, matching, total }
  })
  return candidates
    .filter((c) => c.support >= MANUAL_INSIGHTS.minSupport && c.prevalence <= MANUAL_INSIGHTS.maxConditionPrevalence)
    .sort((a, b) => b.support - a.support || a.prevalence - b.prevalence)
    .slice(0, MANUAL_INSIGHTS.maxShown)
}
