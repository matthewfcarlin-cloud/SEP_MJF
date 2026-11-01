/**
 * Warning signs. "Your line" is learned from your own history: the knee load on
 * the days before your flare-ups. Until there are enough flare-ups it starts from
 * your usual day plus a margin. A "that was wrong" tap loosens it. Warnings are
 * rare, explained, and never fire on a bad sensor reading.
 */
import { addDays } from '../time/day'
import type { DayLoad, FlareDay, PainLog, WarningFeedback } from '../manual/types'

export const WARNING_RULES = {
  minFlaresForPersonal: 2,
  /** Without enough flare-ups, the line starts this far above the usual day. */
  startingMargin: 1.3,
  /** When there is no usual day yet, the line starts here. */
  startingLine: 70,
  /** The personal line never sits below the usual day plus this. */
  floorMargin: 1.1,
  approachingAt: 0.85,
  /** Each "that was wrong" in the window raises the line by this fraction, up to the cap. */
  wrongStep: 0.1,
  wrongCap: 0.3,
  feedbackWindowDays: 30,
  redFlagPain: 8,
} as const

export interface PersonalLine {
  readonly score: number
  readonly source: 'personal' | 'starting'
  /** How many flare-ups taught the line; 0 for the starting line. */
  readonly flaresUsed: number
  readonly loosenedBy: number
}

const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

export function personalLine(loads: readonly DayLoad[], flares: readonly FlareDay[], baseline: number, feedback: readonly WarningFeedback[], today: string): PersonalLine {
  const scoreOn = (d: string): number | undefined => loads.find((l) => l.date === d)?.score
  const before = flares.map((f) => scoreOn(addDays(f.date, -1))).filter((s): s is number => s !== undefined && s > 0)
  const wrong = feedback.filter((f) => f.kind === 'wrong' && f.date > addDays(today, -WARNING_RULES.feedbackWindowDays)).length
  const loosen = Math.min(WARNING_RULES.wrongCap, wrong * WARNING_RULES.wrongStep)
  if (before.length >= WARNING_RULES.minFlaresForPersonal) {
    const raw = Math.max(median(before), baseline * WARNING_RULES.floorMargin)
    return { score: Math.round(raw * (1 + loosen)), source: 'personal', flaresUsed: before.length, loosenedBy: loosen }
  }
  const start = baseline > 0 ? baseline * WARNING_RULES.startingMargin : WARNING_RULES.startingLine
  return { score: Math.round(start * (1 + loosen)), source: 'starting', flaresUsed: 0, loosenedBy: loosen }
}

export type WarningLevel = 'approaching' | 'over'

export interface Warning {
  readonly level: WarningLevel
  readonly score: number
  readonly line: number
  readonly title: string
  readonly why: string
  readonly suggestion: string
}

export interface WarningInput {
  readonly todayScore: number
  readonly line: PersonalLine
  /** False when the tape reading is bad (strip peeling, sensor fault). No warning is ever shown then. */
  readonly signalOk: boolean
  readonly dismissedToday: boolean
}

export function warningFor(input: WarningInput): Warning | undefined {
  const { todayScore: s, line, signalOk, dismissedToday } = input
  if (!signalOk || dismissedToday || s < line.score * WARNING_RULES.approachingAt) return undefined
  const level: WarningLevel = s >= line.score ? 'over' : 'approaching'
  const why =
    line.source === 'personal'
      ? `Your last ${line.flaresUsed} flare-ups came after days around ${line.score}. Today is at ${s}.`
      : `Today is at ${s}, well above your usual day. RECO will learn your own line as you log.`
  return {
    level,
    score: s,
    line: line.score,
    title: level === 'over' ? 'Past your line today' : 'Getting close to your line',
    why,
    suggestion: level === 'over' ? 'Keep the rest of today light and see how it feels in the morning.' : 'A lighter rest of the day keeps you under it.',
  }
}

const RED_FLAG_WORDS = /\b(gave way|giving way|buckled|popped|locked|can'?t (?:straighten|bend|put weight)|numb)/i

/** A sudden spike or the joint giving way: stop normal advice and point to a clinician. */
export function redFlag(painLogs: readonly PainLog[], today: string): PainLog | undefined {
  return painLogs.find((p) => p.date === today && (p.pain >= WARNING_RULES.redFlagPain || (p.note !== undefined && RED_FLAG_WORDS.test(p.note))))
}
