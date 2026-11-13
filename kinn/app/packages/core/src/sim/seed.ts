/**
 * Deterministic sample data for the demo, built from the protocol personas
 * (protocol/simulate.ts). Everything here is labelled SAMPLE DATA in the app.
 *
 * Two layers:
 *  - Recovery: range, swelling grade, self-test and PT values, completed phases and
 *    bend-limit alerts come from the persona's day-by-day simulation, moved so that
 *    `today` is `day` days after surgery.
 *  - Logs: 21 days of activities, pain and check-ins. Maya (the default) keeps the
 *    original story: three game days each followed by a flare-up morning, one after a
 *    gym day, PT twice a week. Other personas get calm weeks, with flare-ups only on the
 *    days their simulation reacts.
 */
import { addDays, daysBetween, startOfDay } from '../time/day'
import type { ActivityLog, BendAlert, Dataset, Intensity, ManualActivity, MorningCheckIn, PainLog, PathMeasurement, PathRecord, PlanExercise, Profile, RomDay } from '../manual/types'
import { EFFUSION_ORDER } from '../protocol/protocols'
import type { EffusionGrade, Metric } from '../protocol/protocols'
import { PERSONAS, simulate } from '../protocol/simulate'
import type { DaySnapshot, Persona, SimResult } from '../protocol/simulate'

export const SEED_DAYS = 21
export const SAMPLE_BEND_MAX_DEG = 85
export const DEFAULT_PERSONA_ID = 'maya-on-track'

export const SEED_PROFILE: Profile = {
  name: 'Maya',
  injury: 'acl',
  injuryDate: '2026-08-28',
  hadSurgery: true,
  sport: 'Soccer',
  hasPt: true,
  goal: 'Back on the pitch',
}

/** Who each persona is in the app, and the recovery day the demo opens on. */
const PERSONA_PROFILES: Readonly<Record<string, { readonly sport: string; readonly goal: string; readonly defaultDay: number }>> = {
  'maya-on-track': { sport: SEED_PROFILE.sport, goal: SEED_PROFILE.goal, defaultDay: 30 },
  'jordan-fast': { sport: 'Basketball', goal: 'Back on court', defaultDay: 30 },
  'sam-stuck-bend': { sport: 'Skiing', goal: 'Ski this winter', defaultDay: 52 },
  'priya-meniscus': { sport: 'Volleyball', goal: 'Back to volleyball', defaultDay: 13 },
  'leo-flare': { sport: 'Football', goal: 'Back on the field', defaultDay: 54 },
  'ava-gave-way': { sport: 'Netball', goal: 'Back on court for the season', defaultDay: 70 },
}

export interface SampleChoice {
  readonly personaId: string
  /** Days since surgery on `today`. */
  readonly day: number
}

export const DEFAULT_SAMPLE: SampleChoice = { personaId: DEFAULT_PERSONA_ID, day: PERSONA_PROFILES[DEFAULT_PERSONA_ID]!.defaultDay }

/** Falls back to Maya, so a persona renamed in a later build can never break loading saved state. */
export function personaById(id: string): Persona {
  return PERSONAS.find((x) => x.id === id) ?? PERSONAS.find((x) => x.id === DEFAULT_PERSONA_ID)!
}

export const defaultDayFor = (personaId: string): number => PERSONA_PROFILES[personaId]?.defaultDay ?? DEFAULT_SAMPLE.day

/** The last day a persona's simulation covers, plus one (today is the day after the last record). */
export const maxSampleDay = (personaId: string): number => personaById(personaId).weeks * 7 + 1

// Simulations are pure and deterministic, so each persona runs once per session.
const simCache = new Map<string, SimResult>()
function simFor(p: Persona): SimResult {
  const hit = simCache.get(p.id)
  if (hit) return hit
  const result = simulate(p)
  simCache.set(p.id, result)
  return result
}

interface DayLog {
  readonly activity: ManualActivity
  readonly intensity: Intensity
}

/** Maya's 21 days. Index 0 is the oldest day (today minus 21), index 20 is yesterday. */
const MAYA_LOGS: readonly DayLog[] = [
  { activity: 'pt', intensity: 'moderate' }, // 0
  { activity: 'practice', intensity: 'moderate' }, // 1
  { activity: 'gym', intensity: 'moderate' }, // 2
  { activity: 'game', intensity: 'hard' }, // 3  -> flare on 4
  { activity: 'pt', intensity: 'light' }, // 4
  { activity: 'walking', intensity: 'light' }, // 5
  { activity: 'practice', intensity: 'moderate' }, // 6
  { activity: 'pt', intensity: 'moderate' }, // 7
  { activity: 'rest', intensity: 'light' }, // 8
  { activity: 'gym', intensity: 'moderate' }, // 9
  { activity: 'game', intensity: 'hard' }, // 10 -> flare on 11
  { activity: 'pt', intensity: 'light' }, // 11
  { activity: 'walking', intensity: 'moderate' }, // 12
  { activity: 'gym', intensity: 'hard' }, // 13 -> flare on 14
  { activity: 'pt', intensity: 'moderate' }, // 14
  { activity: 'practice', intensity: 'moderate' }, // 15
  { activity: 'rest', intensity: 'light' }, // 16
  { activity: 'game', intensity: 'hard' }, // 17 -> flare on 18
  { activity: 'pt', intensity: 'light' }, // 18
  { activity: 'gym', intensity: 'moderate' }, // 19
  { activity: 'practice', intensity: 'hard' }, // 20 (yesterday: load spike -> Steady today)
]

const MAYA_FLARES: Readonly<Record<number, { pain: number; swelling: MorningCheckIn['swelling'] }>> = {
  4: { pain: 6, swelling: 'some' },
  11: { pain: 5, swelling: 'a-lot' },
  14: { pain: 5, swelling: 'some' },
  18: { pain: 6, swelling: 'some' },
}

const CALM_WEEK: readonly DayLog[] = [
  { activity: 'pt', intensity: 'moderate' },
  { activity: 'walking', intensity: 'light' },
  { activity: 'gym', intensity: 'moderate' },
  { activity: 'rest', intensity: 'light' },
  { activity: 'pt', intensity: 'moderate' },
  { activity: 'walking', intensity: 'moderate' },
  { activity: 'gym', intensity: 'light' },
]

const EXERCISES: readonly PlanExercise[] = [
  { id: 'seed-ex-quad', name: 'Quad sets', sets: 3, reps: 10, daysPerWeek: 5 },
  { id: 'seed-ex-heel', name: 'Heel slides', sets: 2, reps: 15, daysPerWeek: 5 },
  { id: 'seed-ex-raise', name: 'Straight leg raises', sets: 3, reps: 10, daysPerWeek: 3 },
]

/** Metrics the app derives from check-ins and pain logs itself, so they are not copied in. */
const DERIVED: ReadonlySet<Metric> = new Set<Metric>(['effusionGrade', 'painOrSwellingAfterExercise'])

const worse = (a: EffusionGrade, b: EffusionGrade): EffusionGrade => (EFFUSION_ORDER.indexOf(a) >= EFFUSION_ORDER.indexOf(b) ? a : b)
const SWELLING_GRADE: Readonly<Record<MorningCheckIn['swelling'], EffusionGrade>> = { none: 'zero', some: '1+', 'a-lot': '2+' }

interface Frame {
  readonly persona: Persona
  readonly today: string
  readonly day: number
  /** Simulated date → the date it lands on in the sample. */
  readonly shift: (simDate: string) => string
  /** Recovery day for log index i (0 = today minus SEED_DAYS). */
  readonly dayAt: (i: number) => number
  readonly dateAt: (i: number) => string
  /** Log indexes on or after surgery day. */
  readonly indexes: readonly number[]
}

function frameFor(choice: SampleChoice, today: string): Frame {
  const persona = personaById(choice.personaId)
  const day = Math.max(1, Math.min(maxSampleDay(persona.id), Math.round(choice.day)))
  const dayAt = (i: number): number => day - SEED_DAYS + i
  return {
    persona,
    today,
    day,
    shift: (simDate) => addDays(today, daysBetween(persona.surgeryDate, simDate) - day),
    dayAt,
    dateAt: (i) => addDays(today, i - SEED_DAYS),
    indexes: Array.from({ length: SEED_DAYS }, (_, i) => i).filter((i) => dayAt(i) >= 0),
  }
}

function logsFor(f: Frame): readonly DayLog[] {
  return f.persona.id === DEFAULT_PERSONA_ID ? MAYA_LOGS : f.indexes.map((i) => CALM_WEEK[i % CALM_WEEK.length]!)
}

/** Morning flare-ups: Maya's story, or the mornings after a persona's simulated reaction days. */
function flareOn(f: Frame, i: number): { pain: number; swelling: MorningCheckIn['swelling'] } | undefined {
  if (f.persona.id === DEFAULT_PERSONA_ID) return MAYA_FLARES[i]
  return f.persona.reactionDays?.(f.dayAt(i) - 1) ? { pain: 5, swelling: 'some' } : undefined
}

function logLayer(f: Frame): Pick<Dataset, 'activityLogs' | 'checkIns' | 'painLogs'> {
  const plan = logsFor(f)
  const at = (i: number): DayLog => (f.persona.id === DEFAULT_PERSONA_ID ? plan[i]! : plan[f.indexes.indexOf(i)]!)
  const activityLogs: ActivityLog[] = f.indexes.map((i) => ({ id: `seed-act-${i}`, date: f.dateAt(i), ...at(i) }))
  // No check-in for today on purpose: the demo opens on the morning check-in card.
  const checkIns: MorningCheckIn[] = f.indexes.map((i) => {
    const flare = flareOn(f, i)
    const graded = f.persona.effusion(f.dayAt(i))
    const base = flare ? { pain: flare.pain, swelling: flare.swelling } : { pain: i % 3 === 0 ? 2 : 1, swelling: 'none' as const }
    return { date: f.dateAt(i), ...base, effusion: worse(graded, SWELLING_GRADE[base.swelling]) }
  })
  const reactions: PainLog[] = f.indexes.flatMap((i) => {
    const next = i + 1
    const causes = f.persona.id === DEFAULT_PERSONA_ID ? at(i).activity === 'game' : flareOn(f, next) !== undefined
    if (!causes || next >= SEED_DAYS) return []
    const date = f.dateAt(i)
    return [{ id: `seed-pain-${i}`, t: startOfDay(date, 21), date, pain: 6, doing: at(i).activity, settled: 'no' as const, settledAt: startOfDay(f.dateAt(next), 8) }]
  })
  const gaveWay = givingWayLog(f)
  // Last night's unanswered log, so the demo shows the "Did it settle?" card.
  const lastNight = f.dateAt(SEED_DAYS - 1)
  const lastNightLog: PainLog = { id: 'seed-pain-last-night', t: startOfDay(lastNight, 20) + 30 * 60_000, date: lastNight, pain: 4, doing: at(SEED_DAYS - 1).activity }
  return { activityLogs, checkIns, painLogs: [...reactions, lastNightLog, ...gaveWay] }
}

/** The morning the knee gave way, logged with the words that make it a red flag. Today or within the logged days. */
function givingWayLog(f: Frame): readonly PainLog[] {
  const day = f.persona.givingWayDay
  if (day === undefined || day > f.day || day < f.day - SEED_DAYS) return []
  const date = addDays(f.today, day - f.day)
  return [{ id: 'seed-pain-gave-way', t: startOfDay(date, 8), date, pain: 7, doing: 'stairs', note: 'Knee gave way on the stairs' }]
}

function recoveryLayer(f: Frame, sim: SimResult): Pick<Dataset, 'romDays' | 'measurements' | 'path' | 'bendAlerts'> {
  const yesterday: DaySnapshot = sim.days[f.day - 1]!
  const romDays: RomDay[] = yesterday.input.rom
    .slice(-SEED_DAYS)
    .map((r) => ({ date: f.shift(r.date), flexionDeg: r.flexionDeg, extensionDeficitDeg: r.extensionDeficitDeg, source: 'reco-tape-sim' as const }))
  const measurements: PathMeasurement[] = (Object.entries(yesterday.input.latest) as [Metric, NonNullable<(typeof yesterday.input.latest)[Metric]>][])
    .filter(([metric]) => !DERIVED.has(metric))
    .map(([metric, m]) => ({ metric, value: m.value, date: f.shift(m.date), by: m.by }))
  // The giving-way answer is given the morning it happens, so it is in the record before yesterday's snapshot knows of it.
  const gaveWayDay = f.persona.givingWayDay
  const gaveWayNow = gaveWayDay !== undefined && gaveWayDay <= f.day && f.day < gaveWayDay + 7
  const withGaveWay: PathMeasurement[] = gaveWayNow
    ? [...measurements.filter((m) => m.metric !== 'instabilityEpisodes7d'), { metric: 'instabilityEpisodes7d', value: 1, date: addDays(f.today, gaveWayDay - f.day), by: 'check-in' }]
    : measurements
  const lifted = f.persona.limitLiftedDay !== undefined && f.day - 1 >= f.persona.limitLiftedDay
  const path: PathRecord = {
    completed: yesterday.input.completed.map((c) => ({ phase: c.phase, date: f.shift(c.date) })),
    ...(lifted ? { ptFlexionMaxDeg: null } : {}),
  }
  const bendAlerts: BendAlert[] = sim.days
    .filter((d) => d.limitAlerts > 0 && d.day <= f.day)
    .map((d) => {
      const date = f.shift(d.date)
      const angle = d.input.rom.at(-1)?.flexionDeg ?? 0
      return { date, t: startOfDay(date, 18), angleDeg: angle, limitDeg: d.view.limits.flexionMaxDeg ?? angle, loaded: false }
    })
  return { romDays, measurements: withGaveWay, path, bendAlerts }
}

function profileFor(f: Frame): Profile {
  const extra = PERSONA_PROFILES[f.persona.id]
  return {
    ...SEED_PROFILE,
    name: f.persona.name,
    injury: f.persona.protocolId === 'meniscus-repair' ? 'meniscus' : 'acl',
    injuryDate: addDays(f.today, -f.day),
    sport: extra?.sport ?? SEED_PROFILE.sport,
    goal: extra?.goal ?? SEED_PROFILE.goal,
    otherKnee: f.persona.otherKnee,
  }
}

/** Sample dataset for a persona, with `today` the morning after the last recorded day. */
export function seedDataset(today: string, choice: SampleChoice = DEFAULT_SAMPLE): Dataset {
  const f = frameFor(choice, today)
  return {
    profile: profileFor(f),
    ...logLayer(f),
    ...recoveryLayer(f, simFor(f.persona)),
    exercises: EXERCISES,
    planMarks: [],
    // The demo tape's max point read as this bend, so its deepest bends land past a 90° limit.
    bendCalibration: { maxDeg: SAMPLE_BEND_MAX_DEG, date: f.dateAt(0) },
  }
}

/** The personas the debug menu lists. */
export const SAMPLE_PERSONAS: readonly { readonly id: string; readonly name: string; readonly story: string; readonly maxDay: number }[] =
  PERSONAS.map((p) => ({ id: p.id, name: p.name, story: p.story, maxDay: maxSampleDay(p.id) }))

/** A PT's sample caseload: every persona on its default day. SAMPLE DATA wherever it shows. */
export function sampleCaseload(today: string): readonly { readonly id: string; readonly data: Dataset }[] {
  return PERSONAS.map((p) => ({ id: p.id, data: seedDataset(today, { personaId: p.id, day: defaultDayFor(p.id) }) }))
}
