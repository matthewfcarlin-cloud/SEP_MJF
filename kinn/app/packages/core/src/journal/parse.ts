/**
 * Sorts a spoken or typed journal entry into the same records the log uses:
 * one activity, an optional pain rating with its context, and recovery notes.
 * Rules on the phone; the athlete sees what was found and can edit or discard it.
 */
import type { Intensity, ManualActivity } from '../manual/types'

export interface JournalActivity {
  readonly activity: ManualActivity
  readonly intensity: Intensity
  readonly minutes?: number
  readonly detail?: string
}

export interface JournalPain {
  /** 0..10 */
  readonly pain: number
  readonly context?: string
}

export interface JournalResult {
  readonly activity?: JournalActivity
  readonly pain?: JournalPain
  readonly recovery: readonly string[]
  readonly summary: string
}

const WORD_NUMBERS: Readonly<Record<string, number>> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  fifteen: 15, twenty: 20, thirty: 30, forty: 40, 'forty-five': 45, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hour: 60, 'an hour': 60, 'two hours': 120,
}

const ACTIVITY_RULES: readonly { re: RegExp; activity: ManualActivity }[] = [
  { re: /\b(game|match|tournament|race)\b/i, activity: 'game' },
  { re: /\b(practice|training|scrimmage)\b/i, activity: 'practice' },
  { re: /\b(pt|physio|physical therapy|rehab session)\b/i, activity: 'pt' },
  { re: /\b(gym|lift(ed|ing)?|weights|strength)\b/i, activity: 'gym' },
  { re: /\b(rest day|rested|off day|couch|took it easy)\b/i, activity: 'rest' },
  { re: /\b(walk(ed|ing)?|stairs|hike|hiked)\b/i, activity: 'walking' },
]

const HARD = /\b(hard|intense|all out|full go|heavy|went hard|max)\b/i
const LIGHT = /\b(easy|light|gentle|short|just|recovery)\b/i

const DETAILS: readonly string[] = ['shooting', 'sprints', 'cutting', 'drills', 'jumping', 'upper body', 'lower body', 'squats', 'step ups', 'bike', 'swimming', 'conditioning']

const RECOVERY = /\b(iced|ice|stretched|foam rolled|rolled out|elevated|compression|massage|heat|rested it|took ibuprofen)\b[^.,;]*/gi

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

function minutesIn(text: string): number | undefined {
  const digits = /\b(\d{1,3})\s*(?:min(?:ute)?s?)\b/i.exec(text)
  if (digits) return Number(digits[1])
  const hours = /\b(\d(?:\.\d)?)\s*hours?\b/i.exec(text)
  if (hours) return Math.round(Number(hours[1]) * 60)
  const word = /\b(an hour|two hours|fifteen|twenty|thirty|forty-five|forty|fifty|sixty|seventy|eighty|ninety)(?:\s*min(?:ute)?s?)?\b/i.exec(text)
  if (word && (word[1]!.includes('hour') || /min/i.test(word[0]))) return WORD_NUMBERS[word[1]!.toLowerCase()]
  return undefined
}

function painIn(text: string): JournalPain | undefined {
  const m = /\b(?:maybe |about |like |around |pain (?:was |is |at )?(?:about |around )?|a )(?:a )?(\d{1,2}|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b(?! (?:min|hour|day|week|month))/i.exec(text)
  if (!m || !/\b(sore|pain|hurt|ache|achy|tender|sharp|stiff)/i.test(text)) return undefined
  const raw = Number.isFinite(Number(m[1])) ? Number(m[1]) : WORD_NUMBERS[m[1]!.toLowerCase()]
  if (raw === undefined) return undefined
  const ctx = /\b(on|during|after|when|while) ([^.,;]+)/i.exec(text.slice(Math.max(0, text.search(/sore|pain|hurt|ache|tender|sharp|stiff/i))))
  const base = { pain: Math.min(10, Math.max(0, raw)) }
  return ctx && !/^(after)$/i.test(ctx[1]!) ? { ...base, context: capitalise(`${ctx[1]!.toLowerCase()} ${ctx[2]!.trim()}`) } : base
}

function activityIn(text: string): JournalActivity | undefined {
  const rule = ACTIVITY_RULES.find((r) => r.re.test(text))
  if (!rule) return undefined
  const intensity: Intensity = HARD.test(text) ? 'hard' : LIGHT.test(text) && rule.activity !== 'rest' ? 'light' : 'moderate'
  const minutes = minutesIn(text)
  const detail = DETAILS.find((d) => new RegExp(`\\b${d}\\b`, 'i').test(text))
  const base: JournalActivity = { activity: rule.activity, intensity }
  return { ...base, ...(minutes !== undefined ? { minutes } : {}), ...(detail ? { detail } : {}) }
}

const ACTIVITY_WORD: Readonly<Record<ManualActivity, string>> = { practice: 'Practice', game: 'Game', gym: 'Gym', pt: 'PT', walking: 'Walking', rest: 'Rest' }

export function parseJournal(text: string): JournalResult {
  const activity = activityIn(text)
  const pain = painIn(text)
  const recovery = [...text.matchAll(RECOVERY)].map((m) => capitalise(m[0].trim()))
  const parts: string[] = []
  if (activity) {
    const head = activity.detail ? `${ACTIVITY_WORD[activity.activity]} · ${activity.detail}` : ACTIVITY_WORD[activity.activity]
    parts.push(activity.minutes !== undefined ? `${head}, ${activity.minutes} min.` : `${head}.`)
  }
  if (pain) parts.push(`Pain ${pain.pain}.`)
  for (const r of recovery) parts.push(`${r}.`)
  return { ...(activity ? { activity } : {}), ...(pain ? { pain } : {}), recovery, summary: parts.join(' ') }
}
