/**
 * Maps a RECO dataset onto the protocol engine's input. Pure: no I/O, no clock.
 * Only ACL reconstruction and meniscus repair have a criterion-based protocol;
 * everything else keeps the time-based plan (datasetToPathInput returns null).
 */
import type { Swelling } from '../domain/types'
import { STATUS_RULES } from '../manual/constants'
import type { Dataset, PathMeasurement, PathRecord, Profile } from '../manual/types'
import { addDays } from '../time/day'
import { advance, buildPath } from './progress'
import type { Measurement, PathInput, PathView } from './progress'
import type { EffusionGrade, Metric, ProtocolId } from './protocols'

/**
 * Until the check-in has the stroke test, the three-word swelling answer maps one grade
 * up on purpose: "none" must not pass a "zero swelling" checkpoint on a guess.
 */
export const SWELLING_TO_EFFUSION: Readonly<Record<Swelling, EffusionGrade>> = {
  none: 'trace',
  some: '1+',
  'a-lot': '2+',
}

/** Days back that a pain or swelling reaction after exercise still counts. */
export const REACTION_WINDOW_DAYS = 7

/** Answers about "this week" stop counting after a week, so an old answer can't pass a checkpoint. */
export const MAX_AGE_DAYS: Partial<Record<Metric, number>> = {
  effusionGrade: 7,
  instabilityEpisodes7d: 7,
}

const fresh = (metric: Metric, date: string, today: string): boolean => {
  const max = MAX_AGE_DAYS[metric]
  return max === undefined || date > addDays(today, -max)
}

export const EMPTY_PATH: PathRecord = { completed: [] }

export function protocolFor(profile: Pick<Profile, 'injury' | 'hadSurgery'>): ProtocolId | null {
  if (!profile.hadSurgery) return null
  if (profile.injury === 'acl') return 'acl-reconstruction'
  if (profile.injury === 'meniscus') return 'meniscus-repair'
  return null
}

const inWindow = (date: string, today: string): boolean => date > addDays(today, -REACTION_WINDOW_DAYS) && date <= today

function latestEffusion(data: Dataset, today: string): Measurement | undefined {
  const last = [...data.checkIns].filter((c) => c.date <= today && fresh('effusionGrade', c.date, today)).sort((a, b) => a.date.localeCompare(b.date)).at(-1)
  if (!last) return undefined
  return { value: last.effusion ?? SWELLING_TO_EFFUSION[last.swelling], date: last.date, by: 'check-in' }
}

/** A pain log that did not settle, or a sore next morning, in the last week. Unknown with no check-ins. */
function reactionAfterExercise(data: Dataset, today: string): Measurement | undefined {
  const checkIns = data.checkIns.filter((c) => inWindow(c.date, today))
  if (checkIns.length === 0) return undefined
  const soreNextMorning = (date: string): boolean => checkIns.some((c) => c.date === addDays(date, 1) && c.pain >= STATUS_RULES.steadyPain)
  const reacted = data.painLogs.some((p) => inWindow(p.date, today) && (p.settled === 'no' || soreNextMorning(p.date)))
  return { value: reacted, date: today, by: 'check-in' }
}

/** Latest entry per metric up to today; on the same day a PT value beats the person's own. */
function latestMeasurements(list: readonly PathMeasurement[], today: string): Partial<Record<Metric, Measurement>> {
  const rank = (m: PathMeasurement): string => `${m.date}|${m.by === 'pt' ? 1 : 0}`
  const sorted = list.filter((m) => m.date <= today && fresh(m.metric, m.date, today)).sort((a, b) => rank(a).localeCompare(rank(b)))
  return Object.fromEntries(sorted.map((m) => [m.metric, { value: m.value, date: m.date, by: m.by }]))
}

/** Values the person or PT entered win over ones derived from check-ins when they are as recent. */
function mergeLatest(derived: Partial<Record<Metric, Measurement>>, entered: Partial<Record<Metric, Measurement>>): Partial<Record<Metric, Measurement>> {
  const out: Partial<Record<Metric, Measurement>> = { ...derived }
  for (const [metric, m] of Object.entries(entered) as [Metric, Measurement][]) {
    const d = derived[metric]
    if (!d || m.date >= d.date) out[metric] = m
  }
  return out
}

export function datasetToPathInput(data: Dataset, today: string): PathInput | null {
  const protocolId = protocolFor(data.profile)
  if (!protocolId) return null
  const effusion = latestEffusion(data, today)
  const reaction = reactionAfterExercise(data, today)
  const derived: Partial<Record<Metric, Measurement>> = {
    ...(effusion ? { effusionGrade: effusion } : {}),
    ...(reaction ? { painOrSwellingAfterExercise: reaction } : {}),
  }
  const record = data.path ?? EMPTY_PATH
  const rom = [...data.romDays]
    .filter((r) => r.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: r.date, flexionDeg: r.flexionDeg, extensionDeficitDeg: r.extensionDeficitDeg }))
  return {
    protocolId,
    surgeryDate: data.profile.injuryDate,
    today,
    latest: mergeLatest(derived, latestMeasurements(data.measurements ?? [], today)),
    rom,
    completed: record.completed,
    ...(record.ptPhase !== undefined ? { ptPhase: record.ptPhase } : {}),
    ...(record.ptFlexionMaxDeg !== undefined ? { ptFlexionMaxDeg: record.ptFlexionMaxDeg } : {}),
    ...(data.profile.otherKnee ? { otherKnee: data.profile.otherKnee } : {}),
  }
}

/** The Path screen's view, or undefined when the injury has no criterion-based protocol. */
export function pathView(data: Dataset, today: string): PathView | undefined {
  const input = datasetToPathInput(data, today)
  return input ? buildPath(input) : undefined
}

/**
 * Called once a day on app open. Returns the record with a newly completed phase,
 * or null when nothing changes (no protocol, not ready, or already advanced today).
 */
export function nextPathRecord(data: Dataset, today: string): PathRecord | null {
  const input = datasetToPathInput(data, today)
  if (!input) return null
  const record = data.path ?? EMPTY_PATH
  if (record.completed.some((c) => c.date === today)) return null
  const step = advance(input)
  if (!step || record.completed.some((c) => c.phase === step.phase)) return null
  // A PT-set phase is done once its checkpoints are met; from there the checkpoints lead again.
  const { ptPhase, ...rest } = record
  const kept = ptPhase !== undefined && ptPhase !== step.phase ? { ptPhase } : {}
  return { ...rest, ...kept, completed: [...record.completed, step] }
}
