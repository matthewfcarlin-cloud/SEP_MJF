/**
 * What a PT should look at, from the patient's own check-ins, pain logs and tape.
 * Flags are about the knee only: pain, swelling, giving way, bending past the limit,
 * progress that has stalled. Never whether exercises were done (feature-spec 1.5, vision:
 * the record is the patient's and must never feel like policing).
 */
import { addDays } from '../time/day'
import { STATUS_RULES } from '../manual/constants'
import { flareUps } from '../manual/insights'
import type { Dataset, FlareDay, PainLog, PathMeasurement } from '../manual/types'
import type { PathView } from '../protocol/progress'
import { hasRedFlagWords, WARNING_RULES } from '../warnings/line'

/** contact-soon: reach out now. worth-a-look: review before the next visit. note: context, no action needed. */
export type FlagTier = 'contact-soon' | 'worth-a-look' | 'note'

export type FlagKind = 'pain-spike' | 'red-flag-words' | 'gave-way' | 'flare-up' | 'bend-limit' | 'levelled-off' | 'behind-typical'

export type FlagSource = 'check-in' | 'pain-log' | 'tape' | 'checkpoints'

export interface ClinicFlag {
  /** Unique within one patient's flags, stable across renders. */
  readonly id: string
  readonly tier: FlagTier
  readonly kind: FlagKind
  readonly title: string
  readonly detail: string
  /** Day the signal comes from (YYYY-MM-DD). */
  readonly date: string
  readonly source: FlagSource
}

export const FLAG_RULES = {
  /** Today and yesterday: a red flag older than that has already been seen or acted on. */
  contactWindowDays: 2,
  /** Flare-ups in the last 3 days are worth a look before the next visit. */
  lookWindowDays: 3,
  /** Bends past the limit are summed over the last week. */
  bendWindowDays: 7,
} as const

export const TIER_ORDER: Readonly<Record<FlagTier, number>> = { 'contact-soon': 0, 'worth-a-look': 1, note: 2 }

const within = (date: string, today: string, days: number): boolean => date > addDays(today, -days) && date <= today

/** Notes that describe the knee giving way, as opposed to other red-flag words (numb, locked, popped). */
const GAVE_WAY_WORDS = /\b(gave way|giving way|buckled)\b/i

function contactSoon(data: Dataset, today: string): readonly ClinicFlag[] {
  const recent = (date: string): boolean => within(date, today, FLAG_RULES.contactWindowDays)
  const recentPain = data.painLogs.filter((p) => recent(p.date))
  const fromPain = recentPain.flatMap((p): ClinicFlag[] => {
    if (p.note !== undefined && hasRedFlagWords(p.note)) {
      return [{ id: `pain-${p.id}`, tier: 'contact-soon', kind: 'red-flag-words', title: 'Reported a red-flag symptom', detail: `In their words: "${p.note}".`, date: p.date, source: 'pain-log' }]
    }
    if ((p.pain ?? 0) >= WARNING_RULES.redFlagPain) {
      return [{ id: `pain-${p.id}`, tier: 'contact-soon', kind: 'pain-spike', title: `Pain ${p.pain} logged`, detail: p.doing ? `During ${p.doing}.` : 'From the pain button.', date: p.date, source: 'pain-log' }]
    }
    return []
  })
  const fromCheckIns = data.checkIns
    .filter((c) => recent(c.date) && c.pain >= WARNING_RULES.redFlagPain)
    .map((c): ClinicFlag => ({ id: `checkin-${c.date}`, tier: 'contact-soon', kind: 'pain-spike', title: `Morning pain ${c.pain}`, detail: 'From the morning check-in.', date: c.date, source: 'check-in' }))
  return [...fromPain, ...fromCheckIns, ...gaveWayFlag(data, recentPain, recent)]
}

/**
 * The giving-way count is a rolling week, so only the latest answer in the window counts, and
 * not at all when a note in the window already says the knee gave way (the same event, told twice).
 */
function gaveWayFlag(data: Dataset, recentPain: readonly PainLog[], recent: (date: string) => boolean): readonly ClinicFlag[] {
  if (recentPain.some((p) => p.note !== undefined && GAVE_WAY_WORDS.test(p.note))) return []
  const latest = (data.measurements ?? [])
    .filter((m) => m.metric === 'instabilityEpisodes7d' && recent(m.date))
    .reduce<PathMeasurement | undefined>((best, m) => (best === undefined || m.date >= best.date ? m : best), undefined)
  if (!latest || typeof latest.value !== 'number' || latest.value <= 0) return []
  const n = latest.value
  return [{ id: `gaveway-${latest.date}`, tier: 'contact-soon', kind: 'gave-way', title: 'Knee gave way', detail: `${n} giving-way episode${n === 1 ? '' : 's'} this week, from their check-in.`, date: latest.date, source: 'check-in' }]
}

const FLARE_DETAIL: Readonly<Record<FlareDay['reason'], (data: Dataset, date: string) => string>> = {
  'morning-pain': (data, date) => `Morning pain ${data.checkIns.find((c) => c.date === date)?.pain ?? STATUS_RULES.flarePain} at check-in.`,
  swelling: () => 'Swelling "a lot" at check-in.',
  'did-not-settle': () => 'Pain from the day before had not settled by morning.',
}

function worthALook(data: Dataset, today: string): readonly ClinicFlag[] {
  // One flag for the run of flare-ups, described by the latest, so a bad few days reads as one thing.
  const recentFlares = flareUps(data.checkIns, data.painLogs).filter((f) => within(f.date, today, FLAG_RULES.lookWindowDays))
  const last = recentFlares.at(-1)
  const flares: readonly ClinicFlag[] = last === undefined ? [] : [{
    id: `flare-${last.date}`,
    tier: 'worth-a-look',
    kind: 'flare-up',
    title: recentFlares.length === 1 ? 'Flare-up' : `${recentFlares.length} flare-ups in ${FLAG_RULES.lookWindowDays} days`,
    detail: FLARE_DETAIL[last.reason](data, last.date),
    date: last.date,
    source: last.reason === 'did-not-settle' ? 'pain-log' : 'check-in',
  }]
  const bends = (data.bendAlerts ?? []).filter((a) => within(a.date, today, FLAG_RULES.bendWindowDays))
  // The limit as it was at the latest bend: a PT may have changed it since.
  const latest = bends.reduce<(typeof bends)[number] | undefined>((l, a) => (l === undefined || a.date > l.date || (a.date === l.date && a.t > l.t) ? a : l), undefined)
  const bendFlag: readonly ClinicFlag[] = latest === undefined ? [] : [{
    id: `bend-${latest.date}`,
    tier: 'worth-a-look',
    kind: 'bend-limit',
    title: `${bends.length} bend${bends.length === 1 ? '' : 's'} past the limit`,
    detail: `Past the ${latest.limitDeg}° limit in the last 7 days, from the tape.`,
    date: latest.date,
    source: 'tape',
  }]
  return [...flares, ...bendFlag]
}

function notes(path: PathView | undefined, today: string): readonly ClinicFlag[] {
  if (!path) return []
  const flat = path.criteria
    .filter((c) => c.status === 'not-met' && c.projection?.trend === 'flat')
    .map((c): ClinicFlag => ({ id: `flat-${c.criterion.id}`, tier: 'note', kind: 'levelled-off', title: `${c.criterion.label}: levelled off`, detail: 'No real change over the last two weeks of range readings.', date: c.measuredOn ?? today, source: 'checkpoints' }))
  const behind: readonly ClinicFlag[] = path.state === 'behind-typical'
    ? [{ id: `behind-${path.phase.n}`, tier: 'note', kind: 'behind-typical', title: `Past the typical window for phase ${path.phase.n}`, detail: `Most people move on around week ${path.phase.typicalWeeks[1]}; this is week ${Math.floor(path.weeksIn)}.`, date: today, source: 'checkpoints' }]
    : []
  return [...flat, ...behind]
}

/** Every flag for one patient, most urgent first, newest first within a tier. */
export function flagsFor(data: Dataset, today: string, path: PathView | undefined): readonly ClinicFlag[] {
  return [...contactSoon(data, today), ...worthALook(data, today), ...notes(path, today)]
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || b.date.localeCompare(a.date))
}
