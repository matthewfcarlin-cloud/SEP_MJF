/**
 * Turns the athlete's own description of their injury into onboarding fields.
 * Rules, not a model: it runs on the phone, explains itself, and leaves a field
 * undefined rather than guessing. The athlete confirms or edits every field.
 */
import type { Injury, Joint, Side } from '../manual/types'

export interface IntakeResult {
  readonly joint?: Joint
  readonly side?: Side
  readonly injury?: Injury
  readonly weeksAgo?: number
  readonly hadSurgery?: boolean
  readonly sport?: string
  readonly goal?: string
  readonly hasPt?: boolean
  readonly ptName?: string
  readonly ptClinic?: string
  /** Field names that were found, in a stable order, for the "Here's what RECO heard" list. */
  readonly found: readonly string[]
}

const NUMBER_WORDS: Readonly<Record<string, number>> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, couple: 2, few: 3, several: 4,
}

const INJURY_RULES: readonly { re: RegExp; injury: Injury; joint: Joint }[] = [
  { re: /\bacl\b|anterior cruciate/i, injury: 'acl', joint: 'knee' },
  { re: /menisc/i, injury: 'meniscus', joint: 'knee' },
  { re: /rotator cuff|\bcuff\b/i, injury: 'rotator-cuff', joint: 'shoulder' },
  { re: /dislocat\w* (my |the )?(left |right )?shoulder|shoulder dislocat/i, injury: 'shoulder-dislocation', joint: 'shoulder' },
  { re: /\bucl\b|tommy john/i, injury: 'ucl', joint: 'elbow' },
  { re: /tennis elbow|golfer'?s elbow|epicondyl/i, injury: 'tennis-elbow', joint: 'elbow' },
]

const JOINT_RULES: readonly { re: RegExp; joint: Joint }[] = [
  { re: /\bknee|kneecap|patell/i, joint: 'knee' },
  { re: /\bshoulder/i, joint: 'shoulder' },
  { re: /\belbow/i, joint: 'elbow' },
]

const SPORTS: readonly string[] = [
  'basketball', 'soccer', 'football', 'volleyball', 'skiing', 'snowboarding', 'running', 'tennis', 'baseball',
  'softball', 'lacrosse', 'rugby', 'hockey', 'climbing', 'swimming', 'pitching', 'golf', 'cycling', 'crossfit',
]

const SPORT_NAMES: Readonly<Record<string, string>> = { pitching: 'Baseball', skiing: 'Skiing', running: 'Running' }

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

function toNumber(word: string): number | undefined {
  const n = Number(word)
  if (Number.isFinite(n)) return n
  return NUMBER_WORDS[word.toLowerCase()]
}

const UNIT_WEEKS: Readonly<Record<string, number>> = { day: 1 / 7, week: 1, month: 4.345, year: 52.18 }

function findWeeksAgo(text: string): number | undefined {
  const m = /\b(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|couple|few|several)(?: of)? (day|week|month|year)s?\b(?: ago)?/i.exec(text)
  if (!m) return undefined
  const n = toNumber(m[1]!)
  const unit = UNIT_WEEKS[m[2]!.toLowerCase()]
  if (n === undefined || unit === undefined) return undefined
  return Math.max(0, Math.round(n * unit))
}

function findSurgery(text: string): boolean | undefined {
  if (/\b(no|didn'?t have|did not have|without|never had|skipped)\b[^.]{0,20}\b(surgery|operation|reconstruction|repair)/i.test(text)) return false
  if (/\b(surgery|reconstruction|repair|operat(ed|ion)|scope|arthroscop)/i.test(text)) return true
  return undefined
}

function findPt(text: string): { hasPt?: boolean; ptName?: string; ptClinic?: string } {
  if (/\b(no|don'?t have a|not seeing a|without a)\s*(pt|physio|physical therapist)\b/i.test(text)) return { hasPt: false }
  // Case-sensitive on purpose so the name and clinic must be capitalised; the role word is matched either way.
  const named = /\b[Mm]y (?:[Pp][Tt]|[Pp]hysio|[Pp]hysical [Tt]herapist)(?: is| named)? ([A-Z][a-z]+)(?: at ([A-Z][\w'-]+(?: [A-Z][\w'-]+)*))?/.exec(text)
  if (named) {
    const out: { hasPt: boolean; ptName: string; ptClinic?: string } = { hasPt: true, ptName: named[1]! }
    return named[2] ? { ...out, ptClinic: named[2] } : out
  }
  if (/\b(pt|physio|physical therapist|physical therapy)\b/i.test(text)) return { hasPt: true }
  return {}
}

function findGoal(text: string): string | undefined {
  const m = /\b(?:i )?(?:want|hope|need|trying|plan)(?: to)?(?: get)? (?:to )?((?:be )?back (?:for|to|in|on|playing|by) [^.,;]+|run again|play again|[a-z]+ again|back [^.,;]+)/i.exec(text)
  if (!m) return undefined
  const goal = m[1]!.replace(/^be /i, '').trim()
  return capitalise(goal)
}

/** Parse a free-text injury description. Fields not clearly stated are left undefined. */
export function parseIntake(text: string): IntakeResult {
  const rule = INJURY_RULES.find((r) => r.re.test(text))
  const joint = rule?.joint ?? JOINT_RULES.find((r) => r.re.test(text))?.joint
  const sideMatch = /\b(left|right)\b/i.exec(text)
  const sportWord = SPORTS.find((s) => new RegExp(`\\b${s}\\b`, 'i').test(text))
  const pt = findPt(text)
  const fields = {
    joint,
    side: sideMatch ? (sideMatch[1]!.toLowerCase() as Side) : undefined,
    injury: rule?.injury,
    weeksAgo: findWeeksAgo(text),
    hadSurgery: findSurgery(text),
    sport: sportWord ? (SPORT_NAMES[sportWord] ?? capitalise(sportWord)) : undefined,
    goal: findGoal(text),
    hasPt: pt.hasPt,
    ptName: pt.ptName,
    ptClinic: pt.ptClinic,
  }
  const order = ['joint', 'side', 'injury', 'weeksAgo', 'hadSurgery', 'sport', 'goal', 'hasPt', 'ptName', 'ptClinic'] as const
  const found = order.filter((k) => fields[k] !== undefined)
  const defined = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined))
  return { ...defined, found } as IntakeResult
}
