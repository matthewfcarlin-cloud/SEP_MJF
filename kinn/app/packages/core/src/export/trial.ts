import { addDays, dayKey, localDateKey } from '../time/day'
import { dayLoad } from '../manual/load'
import type { GuidanceLevel } from '../guidance/read'
import type { ActivityLog, Dataset, EveningCheck, MorningCheckIn, PainLog, PlanExercise, PlanMark, Profile, RomDay, WarningFeedback } from '../manual/types'
import { seedDataset } from '../sim/seed'
import { tapeDays } from '../tape/days'
import type { TapeDay } from '../tape/days'
import type { CalibrationEvent, CursorState, StoredRecord } from '../tape/types'

/**
 * Trial data export: everything an athlete trial needs to analyse, in one JSON document plus
 * two flat CSVs (one row per day, one row per tape minute). Every manual record carries
 * `sample: true` when it came from the built-in demo athlete rather than the person wearing
 * the tape, so analysis can drop it.
 */

export const TRIAL_EXPORT_SCHEMA = 'reco.trial-export'
export const TRIAL_EXPORT_VERSION = 2

type Sampled<T> = T & { readonly sample: boolean }
type ExportedProfile = Omit<Profile, 'name' | 'goal' | 'story' | 'ptName' | 'ptEmail'>
type ExportedPain = Omit<PainLog, 'note' | 'voiceUri' | 'photoUri'> & { readonly hasNote: boolean; readonly hasVoice: boolean; readonly hasPhoto: boolean }

export interface TrialExportInput {
  readonly data: Dataset
  /** The day the sample data was laid down for (AppState.seededFor). */
  readonly seededFor: string
  readonly today: string
  readonly tape: {
    readonly cursors: readonly CursorState[]
    readonly calibrations: readonly CalibrationEvent[]
    readonly records: readonly StoredRecord[]
  }
  readonly exportedAt: number
  readonly appVersion: string
  readonly guidance?: GuidanceLevel
}

/** Counts for the pilot's questions. Words the person spoke or typed stay out of the export. */
export interface PilotCounts {
  readonly painTaps: number
  readonly painTapsWithDetail: number
  readonly journalEntries: number
  readonly journalByVoice: number
  readonly warningsWrong: number
  readonly warningsHelpful: number
}

export interface DailyRow {
  readonly date: string
  readonly activities: string
  readonly loadUnits: number
  readonly loadScore: number
  readonly morningPain: number | ''
  readonly swelling: string
  readonly painLogs: number
  readonly maxLoggedPain: number | ''
  readonly unsettledPain: number
  readonly tapeWornMin: number | ''
  readonly tapeActiveMin: number | ''
  readonly tapeReps: number | ''
  readonly tapePeakPct: number | ''
  readonly tapeMeanPct: number | ''
  readonly sample: boolean
}

export interface TrialExport {
  readonly schema: typeof TRIAL_EXPORT_SCHEMA
  readonly version: typeof TRIAL_EXPORT_VERSION
  readonly exportedAt: string
  readonly appVersion: string
  readonly tzOffsetMin: number
  readonly guidance: GuidanceLevel
  readonly profile: ExportedProfile
  readonly exercises: readonly Omit<PlanExercise, 'note'>[]
  readonly planMarks: readonly PlanMark[]
  readonly warningFeedback: readonly WarningFeedback[]
  readonly eveningChecks: readonly EveningCheck[]
  readonly counts: PilotCounts
  readonly activityLogs: readonly Sampled<ActivityLog>[]
  readonly painLogs: readonly Sampled<ExportedPain>[]
  readonly checkIns: readonly Sampled<MorningCheckIn>[]
  readonly romDays: readonly Sampled<RomDay>[]
  readonly tape: {
    readonly devices: readonly CursorState[]
    readonly calibrations: readonly CalibrationEvent[]
    readonly days: readonly TapeDay[]
    readonly minutes: readonly StoredRecord[]
  }
  readonly daily: readonly DailyRow[]
}

const isSeedId = (id: string): boolean => id.startsWith('seed-')

/** Check-ins have no id, so a check-in counts as sample when it matches the seed exactly. */
function sampleCheckIns(seededFor: string): (c: MorningCheckIn) => boolean {
  const seed = seedDataset(seededFor).checkIns
  return (c) => seed.some((s) => s.date === c.date && s.pain === c.pain && s.swelling === c.swelling)
}

export function trialExport(input: TrialExportInput): TrialExport {
  const { data, tape } = input
  const isSampleCheckIn = sampleCheckIns(input.seededFor)
  const activityLogs = data.activityLogs.map((l) => ({ ...l, sample: isSeedId(l.id) }))
  // A note, voice file or photo stays on the phone; the export keeps only that one existed.
  const painLogs = data.painLogs.map(({ note, voiceUri, photoUri, ...p }) => ({ ...p, hasNote: note !== undefined, hasVoice: voiceUri !== undefined, hasPhoto: photoUri !== undefined, sample: isSeedId(p.id) }))
  const checkIns = data.checkIns.map((c) => ({ ...c, sample: isSampleCheckIn(c) }))
  // Every RomDay today is simulated; the v1 tape cannot measure angle.
  const romDays = data.romDays.map((r) => ({ ...r, sample: r.source === 'reco-tape-sim' }))
  const minutes = [...tape.records].sort((a, b) => (a.epoch ?? 0) - (b.epoch ?? 0) || a.index - b.index)
  const days = tapeDays(minutes)
  return {
    schema: TRIAL_EXPORT_SCHEMA,
    version: TRIAL_EXPORT_VERSION,
    exportedAt: new Date(input.exportedAt).toISOString(),
    appVersion: input.appVersion,
    tzOffsetMin: -new Date(input.exportedAt).getTimezoneOffset(),
    guidance: input.guidance ?? 'descriptive',
    profile: withoutPrivateProfile(data.profile),
    exercises: (data.exercises ?? []).map(({ note: _note, ...e }) => e),
    planMarks: data.planMarks ?? [],
    warningFeedback: data.warningFeedback ?? [],
    eveningChecks: data.eveningChecks ?? [],
    counts: pilotCounts(data),
    activityLogs,
    painLogs,
    checkIns,
    romDays,
    tape: { devices: [...tape.cursors], calibrations: [...tape.calibrations], days, minutes },
    daily: dailyRows(input.today, activityLogs, painLogs, checkIns, days),
  }
}

/** Their name, their own words and their PT's details are not needed to analyse the pilot, so they stay on the phone. */
function withoutPrivateProfile({ name: _name, goal: _goal, story: _story, ptName: _ptName, ptEmail: _ptEmail, ...profile }: Profile): ExportedProfile {
  return profile
}

function maxRating(pains: readonly ExportedPain[]): number | '' {
  const rated = pains.map((p) => p.pain).filter((p): p is number => p !== undefined)
  return rated.length ? Math.max(...rated) : ''
}

function pilotCounts(data: Dataset): PilotCounts {
  const taps = data.painLogs.filter((p) => p.kind !== 'evening')
  const journal = data.journal ?? []
  const feedback = data.warningFeedback ?? []
  return {
    painTaps: taps.length,
    painTapsWithDetail: taps.filter((p) => p.pain !== undefined || p.doing !== undefined || p.note !== undefined || p.voiceUri !== undefined || p.photoUri !== undefined).length,
    journalEntries: journal.length,
    journalByVoice: journal.filter((j) => j.source === 'voice').length,
    warningsWrong: feedback.filter((f) => f.kind === 'wrong').length,
    warningsHelpful: feedback.filter((f) => f.kind === 'helpful').length,
  }
}

/** One row per day from the first record of any kind through today. */
function dailyRows(
  today: string,
  activityLogs: readonly Sampled<ActivityLog>[],
  painLogs: readonly Sampled<ExportedPain>[],
  checkIns: readonly Sampled<MorningCheckIn>[],
  days: readonly TapeDay[],
): readonly DailyRow[] {
  const first = [...activityLogs.map((l) => l.date), ...painLogs.map((p) => p.date), ...checkIns.map((c) => c.date), ...days.map((d) => d.date)]
    .filter((d) => d <= today)
    .sort()[0]
  if (!first) return []
  const rows: DailyRow[] = []
  for (let date = first; date <= today; date = addDays(date, 1)) {
    const acts = activityLogs.filter((l) => l.date === date)
    const pains = painLogs.filter((p) => p.date === date)
    const check = checkIns.find((c) => c.date === date)
    const tapeDay = days.find((d) => d.date === date)
    const load = dayLoad(date, acts)
    const sampleParts = [...acts, ...pains, ...(check ? [check] : [])]
    rows.push({
      date,
      activities: acts.map((l) => `${l.activity}:${l.intensity}`).join(' '),
      loadUnits: load.units,
      loadScore: load.score,
      morningPain: check?.pain ?? '',
      swelling: check?.swelling ?? '',
      painLogs: pains.length,
      maxLoggedPain: maxRating(pains),
      unsettledPain: pains.filter((p) => p.settled === 'no').length,
      tapeWornMin: tapeDay?.wornMinutes ?? '',
      tapeActiveMin: tapeDay?.activeMinutes ?? '',
      tapeReps: tapeDay?.reps ?? '',
      tapePeakPct: tapeDay?.peakPct ?? '',
      tapeMeanPct: tapeDay?.meanPct ?? '',
      sample: sampleParts.length > 0 && sampleParts.every((p) => p.sample),
    })
  }
  return rows
}

// ---------------------------------------------------------------- CSV

const cell = (v: unknown): string => {
  const s = v === undefined || v === null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv<T extends object>(rows: readonly T[], columns: readonly (keyof T & string)[]): string {
  const lines = [columns.join(',')]
  for (const r of rows) lines.push(columns.map((c) => cell(r[c])).join(','))
  return `${lines.join('\n')}\n`
}

export const DAILY_COLUMNS: readonly (keyof DailyRow & string)[] = [
  'date',
  'activities',
  'loadUnits',
  'loadScore',
  'morningPain',
  'swelling',
  'painLogs',
  'maxLoggedPain',
  'unsettledPain',
  'tapeWornMin',
  'tapeActiveMin',
  'tapeReps',
  'tapePeakPct',
  'tapeMeanPct',
  'sample',
]

export const dailyCsv = (exp: TrialExport): string => toCsv(exp.daily, DAILY_COLUMNS)

interface MinuteRow {
  readonly deviceId: string
  readonly generation: number
  readonly index: number
  readonly epoch: number | ''
  readonly localTime: string
  readonly day: string
  readonly timeSource: string
  readonly bootId: number
  readonly sensorOk: number
  readonly meanPct: number
  readonly peakPct: number
  readonly reps: number
  readonly activeSeconds: number
}

const MINUTE_COLUMNS: readonly (keyof MinuteRow & string)[] = [
  'deviceId',
  'generation',
  'index',
  'epoch',
  'localTime',
  'day',
  'timeSource',
  'bootId',
  'sensorOk',
  'meanPct',
  'peakPct',
  'reps',
  'activeSeconds',
]

const localTime = (epochS: number): string => {
  const d = new Date(epochS * 1000)
  return `${localDateKey(epochS * 1000)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** One row per synced tape minute. Activation is in percent of the calibrated max. */
export function tapeMinutesCsv(exp: TrialExport): string {
  const rows: MinuteRow[] = exp.tape.minutes.map((r) => ({
    deviceId: r.deviceId,
    generation: r.generation,
    index: r.index,
    epoch: r.epoch ?? '',
    localTime: r.epoch !== undefined ? localTime(r.epoch) : '',
    day: r.epoch !== undefined ? dayKey(r.epoch * 1000) : '',
    timeSource: r.timeSource,
    bootId: r.bootId,
    sensorOk: r.sensorOk ? 1 : 0,
    meanPct: r.mean / 10,
    peakPct: r.peak / 10,
    reps: r.reps,
    activeSeconds: r.activeSeconds,
  }))
  return toCsv(rows, MINUTE_COLUMNS)
}

/** File-name stem like reco-trial-2026-10-27. */
export const exportStem = (exp: TrialExport): string => `reco-trial-${localDateKey(Date.parse(exp.exportedAt))}`
