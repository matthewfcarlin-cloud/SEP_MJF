/**
 * Checkpoint values and projections in words, for the patient's Path screen and the
 * clinician view. Same facts, two voices: the patient reads "your other knee", a PT reads
 * "the other knee". Projections always say "at your current pace" / "at current pace" and
 * give a range, never a date.
 */
import type { CriterionView, Projection } from './progress'

export type Voice = 'patient' | 'clinician'

const DAYS_PER_WEEK = 7
const DAYS_SHOWN_AS_DAYS = 14

const round = (v: number): number => Math.round(v)

const VOICE = {
  patient: { other: 'your other knee', notYetPt: 'Your PT measures this', flat: 'Levelled off. Worth raising with your PT.', pace: 'at your current pace' },
  clinician: { other: 'the other knee', notYetPt: 'Measured in clinic', flat: 'Levelled off over the last two weeks', pace: 'at current pace' },
} as const

function numberWords(c: CriterionView, v: number, voice: Voice): string {
  const other = VOICE[voice].other
  switch (c.criterion.metric) {
    case 'extensionDeficitDeg': return v === 0 ? 'Fully straight' : `${v}° short of straight`
    case 'flexionDeg': return `Best bend ${v}°`
    case 'flexionGapToOtherKneeDeg': return v === 0 ? `Same as ${other}` : `${v}° less than ${other}`
    case 'extensionGapToOtherKneeDeg': return v === 0 ? `Same as ${other}` : `${v}° short of ${other}`
    case 'jointPositionErrorDeg': return `Off by ${round(v)}°`
    case 'singleLegSquats60': return `${v} of 10`
    case 'ikdcScore': return `${round(v)}`
    case 'instabilityEpisodes7d': return v === 0 ? 'None this week' : `${v} this week`
    default: return `${round(v)}%`
  }
}

/** A checkpoint's current value in words. */
export function criterionValueWords(c: CriterionView, voice: Voice): string {
  const v = c.current
  if (v === undefined) return c.criterion.measuredBy === 'pt' ? VOICE[voice].notYetPt : 'Not measured yet'
  if (typeof v === 'boolean') {
    if (c.criterion.metric === 'painOrSwellingAfterExercise') return v ? 'A reaction in the last 7 days' : 'None in the last 7 days'
    return v ? 'Yes' : 'Not yet'
  }
  if (typeof v === 'string') return `Swelling: ${v === 'zero' ? 'none' : v}`
  return numberWords(c, v, voice)
}

/** How long an open range checkpoint may take, or undefined when there is nothing to say. */
export function projectionWords(p: Projection | undefined, voice: Voice): string | undefined {
  if (!p) return undefined
  if (p.trend === 'flat') return VOICE[voice].flat
  if (p.trend !== 'improving' || p.daysLow === null || p.daysHigh === null) return undefined
  if (p.daysHigh <= 1) return 'Any day now'
  const pace = VOICE[voice].pace
  if (p.daysHigh <= DAYS_SHOWN_AS_DAYS) return `About ${p.daysLow}–${p.daysHigh} days ${pace}`
  return `About ${Math.round(p.daysLow / DAYS_PER_WEEK)}–${Math.round(p.daysHigh / DAYS_PER_WEEK)} weeks ${pace}`
}
