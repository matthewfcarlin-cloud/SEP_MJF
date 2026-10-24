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
  /** Flare-up dates this condition held before. Two conditions with the same set say the same thing. */
  readonly matchedDates: readonly string[]
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
    const matchedDates = input.flares.filter((f) => c.holdsOn(f.date)).map((f) => f.date)
    const matching = matchedDates.length
    const daysHeld = input.dates.filter(c.holdsOn).length
    const prevalence = input.dates.length === 0 ? 1 : daysHeld / input.dates.length
    return { id: c.id, text: phrase(matching, total, c.phrase), support: matching / total, prevalence, matching, total, matchedDates }
  })
  const ranked = candidates
    .filter((c) => c.support >= MANUAL_INSIGHTS.minSupport && c.prevalence <= MANUAL_INSIGHTS.maxConditionPrevalence)
    .sort((a, b) => b.support - a.support || a.prevalence - b.prevalence)
  return dedupeBySameFlares(ranked).slice(0, MANUAL_INSIGHTS.maxShown)
}

/** Keep the first (rarest) condition for each distinct set of flare-ups; the rest restate it. */
function dedupeBySameFlares(ranked: readonly InsightCandidate[]): readonly InsightCandidate[] {
  const seen = new Set<string>()
  return ranked.filter((c) => {
    const key = c.matchedDates.join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export interface LoadContrast {
  readonly beforeFlareAvg: number
  readonly otherDaysAvg: number
  readonly text: string
}

const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length

/**
 * Average load on the day before a flare-up versus the day before every other
 * morning. Shown only when both sides have data and the gap is worth a sentence.
 */
export function loadContrast(input: InsightsInput): LoadContrast | undefined {
  if (input.flares.length < MANUAL_INSIGHTS.minFlareUps) return undefined
  const scoreOn = (date: string): number | undefined => input.loads.find((l) => l.date === date)?.score
  const flareDates = new Set(input.flares.map((f) => f.date))
  const before = (dates: readonly string[]): number[] =>
    dates.map((d) => scoreOn(addDays(d, -1))).filter((s): s is number => s !== undefined)
  const beforeFlare = before([...flareDates])
  const beforeOthers = before(input.dates.filter((d) => !flareDates.has(d)))
  if (beforeFlare.length === 0 || beforeOthers.length === 0) return undefined
  const beforeFlareAvg = Math.round(mean(beforeFlare))
  const otherDaysAvg = Math.round(mean(beforeOthers))
  if (Math.abs(beforeFlareAvg - otherDaysAvg) < MANUAL_INSIGHTS.minContrast) return undefined
  return {
    beforeFlareAvg,
    otherDaysAvg,
    text: `The day before a flare-up, your knee load averaged ${beforeFlareAvg}. Before other mornings it averaged ${otherDaysAvg}.`,
  }
}
