import type {
  ActivityLog,
  Dataset,
  Doing,
  EveningWord,
  GuidanceLevel,
  Intensity,
  JournalEntry,
  ManualActivity,
  MorningCheckIn,
  PainLog,
  PlanExercise,
  Profile,
  RomDay,
  Settled,
  Swelling,
  WarningFeedback,
} from '@reco/core'
import { emptyDataset, seedDataset, SEED_PROFILE } from '@reco/core'

export type DataMode = 'real' | 'sample'
export type NotificationMode = 'morning' | 'morning-evening' | 'visits' | 'off'
/** A field set to undefined is cleared. */
export type PainPatch = { readonly [K in 'pain' | 'doing' | 'note' | 'voiceUri' | 'photoUri']?: PainLog[K] | undefined }

export interface AppState {
  readonly onboarded: boolean
  readonly seededFor: string
  readonly data: Dataset
  readonly guidance: GuidanceLevel
  readonly notifications: NotificationMode
  /** When the person agreed at the consent screen. Real mode only. */
  readonly consentAt?: number
  readonly lastExportAt?: number
  /** "Not now" on the weekly backup prompt. */
  readonly backupDismissedAt?: number
}

/** Real and sample data are separate states, saved under separate keys, so they can never mix. */
export interface RootState {
  readonly mode: DataMode
  readonly real: AppState
  readonly sample: AppState
}

export type Action =
  | { type: 'hydrate'; root: RootState }
  | { type: 'setMode'; mode: DataMode }
  | { type: 'reseedSample'; today: string }
  | { type: 'completeOnboarding'; profile: Profile; notifications: NotificationMode; consentAt: number; rom?: RomDay; exercises?: readonly PlanExercise[] }
  | { type: 'updateProfile'; patch: Partial<Profile> }
  | { type: 'deleteMyData'; today: string }
  | { type: 'setGuidance'; guidance: GuidanceLevel }
  | { type: 'setNotifications'; mode: NotificationMode }
  | { type: 'markExported'; t: number }
  | { type: 'dismissBackup'; t: number }
  | { type: 'addActivity'; date: string; activity: ManualActivity; intensity: Intensity; id: string }
  | { type: 'removeActivity'; id: string }
  | { type: 'addPress'; id: string; date: string; t: number }
  | { type: 'addRatedPain'; id: string; date: string; t: number; pain: number; doing?: Doing; note?: string }
  | { type: 'updatePain'; id: string; patch: PainPatch }
  | { type: 'removePain'; id: string }
  | { type: 'answerSettle'; id: string; settled: Settled; t: number }
  | { type: 'setCheckIn'; date: string; pain: number; swelling: Swelling }
  | { type: 'setEvening'; id: string; date: string; t: number; word: EveningWord }
  | { type: 'addMeasurement'; rom: RomDay }
  | { type: 'upsertExercise'; exercise: PlanExercise }
  | { type: 'removeExercise'; id: string }
  | { type: 'togglePlanMark'; date: string; itemId: string }
  | { type: 'addJournal'; entry: JournalEntry }
  | { type: 'warningFeedback'; feedback: WarningFeedback }

export const initialReal = (today: string): AppState => ({
  onboarded: false,
  seededFor: today,
  data: emptyDataset(today),
  guidance: 'descriptive',
  notifications: 'off',
})

export const initialSample = (today: string): AppState => ({
  onboarded: true,
  seededFor: today,
  data: seedDataset(today),
  guidance: 'descriptive',
  notifications: 'off',
})

export const initialRoot = (today: string, mode: DataMode): RootState => ({ mode, real: initialReal(today), sample: initialSample(today) })

export const active = (root: RootState): AppState => root[root.mode]

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null

/** True when the person has added nothing of their own, so the sample can safely move with the calendar. */
const isSeed = (id: string): boolean => id.startsWith('seed-')
export const onlySeedData = (data: Dataset): boolean =>
  data.activityLogs.every((l) => isSeed(l.id)) && data.painLogs.every((p) => isSeed(p.id))

/** Removes everything the old builds copied in from the sample athlete. Check-ins have no id, so they match on value. */
function withoutSample(data: Dataset, seededFor: string, today: string): Dataset {
  const seed = seedDataset(seededFor).checkIns
  const isSeedCheckIn = (c: MorningCheckIn): boolean => seed.some((s) => s.date === c.date && s.pain === c.pain && s.swelling === c.swelling)
  const isSampleProfile = data.profile.name === SEED_PROFILE.name && data.profile.goal === SEED_PROFILE.goal
  return {
    ...data,
    profile: isSampleProfile ? emptyDataset(today).profile : data.profile,
    activityLogs: data.activityLogs.filter((l) => !isSeed(l.id)),
    painLogs: data.painLogs.filter((p) => !isSeed(p.id)),
    checkIns: data.checkIns.filter((c) => !isSeedCheckIn(c)),
    romDays: data.romDays.filter((r) => r.source !== 'reco-tape-sim'),
  }
}

function looksLikeDataset(x: unknown): x is Dataset {
  return isRecord(x) && isRecord(x.profile) && Array.isArray(x.activityLogs) && Array.isArray(x.painLogs) && Array.isArray(x.checkIns) && Array.isArray(x.romDays)
}

/**
 * Reads whatever is saved under the real key. Anything unreadable starts empty, never from the
 * sample. A state from before the consent screen keeps the person's own logs and goes through
 * consent again.
 */
export function migrateReal(stored: unknown, today: string): AppState {
  if (!isRecord(stored) || !looksLikeDataset(stored.data)) return initialReal(today)
  const seededFor = typeof stored.seededFor === 'string' ? stored.seededFor : today
  if (typeof stored.consentAt === 'number') {
    return { ...initialReal(today), ...(stored as unknown as AppState) }
  }
  return { ...initialReal(today), data: withoutSample(stored.data, seededFor, today) }
}

const withData = (state: AppState, data: Partial<Dataset>): AppState => ({ ...state, data: { ...state.data, ...data } })

const upsertCheckIn = (checkIns: readonly MorningCheckIn[], next: MorningCheckIn): readonly MorningCheckIn[] => [
  ...checkIns.filter((c) => c.date !== next.date),
  next,
]

/** Applies a patch; a field set to undefined comes off the record. */
function patchPain(log: PainLog, patch: PainPatch): PainLog {
  const merged = { ...log, ...patch }
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined)) as unknown as PainLog
}

function setEvening(state: AppState, action: Extract<Action, { type: 'setEvening' }>): AppState {
  const others = (state.data.eveningChecks ?? []).filter((c) => c.date !== action.date)
  const painLogs = state.data.painLogs.filter((p) => !(p.date === action.date && p.kind === 'evening'))
  const added: readonly PainLog[] = action.word === 'quiet' ? [] : [{ id: action.id, date: action.date, t: action.t, kind: 'evening' }]
  return withData(state, { eveningChecks: [...others, { date: action.date, word: action.word }], painLogs: [...painLogs, ...added] })
}

function togglePlanMark(state: AppState, date: string, itemId: string): AppState {
  const marks = state.data.planMarks ?? []
  const isMark = (m: { date: string; itemId: string }): boolean => m.date === date && m.itemId === itemId
  return withData(state, { planMarks: marks.some(isMark) ? marks.filter((m) => !isMark(m)) : [...marks, { date, itemId, done: true }] })
}

function upsertExercise(state: AppState, exercise: PlanExercise): AppState {
  const list = state.data.exercises ?? []
  const next = list.some((e) => e.id === exercise.id) ? list.map((e) => (e.id === exercise.id ? exercise : e)) : [...list, exercise]
  return withData(state, { exercises: next })
}

function completeOnboarding(state: AppState, action: Extract<Action, { type: 'completeOnboarding' }>): AppState {
  const romDays = action.rom ? [...state.data.romDays.filter((r) => r.date !== action.rom?.date), action.rom] : state.data.romDays
  const exercises = [...(state.data.exercises ?? []), ...(action.exercises ?? [])]
  return { ...withData(state, { profile: action.profile, romDays, exercises }), onboarded: true, consentAt: action.consentAt, notifications: action.notifications }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'completeOnboarding':
      return completeOnboarding(state, action)
    case 'updateProfile':
      return withData(state, { profile: { ...state.data.profile, ...action.patch } })
    case 'setGuidance':
      return { ...state, guidance: action.guidance }
    case 'setNotifications':
      return { ...state, notifications: action.mode }
    case 'markExported':
      return { ...state, lastExportAt: action.t }
    case 'dismissBackup':
      return { ...state, backupDismissedAt: action.t }
    case 'addActivity': {
      const log: ActivityLog = { id: action.id, date: action.date, activity: action.activity, intensity: action.intensity }
      return withData(state, { activityLogs: [...state.data.activityLogs, log] })
    }
    case 'removeActivity':
      return withData(state, { activityLogs: state.data.activityLogs.filter((l) => l.id !== action.id) })
    case 'addPress':
      return withData(state, { painLogs: [...state.data.painLogs, { id: action.id, date: action.date, t: action.t, kind: 'press' }] })
    case 'addRatedPain': {
      const { id, date, t, pain, doing, note } = action
      const log: PainLog = { id, date, t, pain, kind: 'press', ...(doing ? { doing } : {}), ...(note ? { note } : {}) }
      return withData(state, { painLogs: [...state.data.painLogs, log] })
    }
    case 'updatePain':
      return withData(state, { painLogs: state.data.painLogs.map((p) => (p.id === action.id ? patchPain(p, action.patch) : p)) })
    case 'removePain':
      return withData(state, { painLogs: state.data.painLogs.filter((p) => p.id !== action.id) })
    case 'answerSettle':
      return withData(state, {
        painLogs: state.data.painLogs.map((p) => (p.id === action.id ? { ...p, settled: action.settled, settledAt: action.t } : p)),
      })
    case 'setCheckIn':
      return withData(state, {
        checkIns: upsertCheckIn(state.data.checkIns, { date: action.date, pain: action.pain, swelling: action.swelling }),
      })
    case 'setEvening':
      return setEvening(state, action)
    case 'addMeasurement':
      return withData(state, { romDays: [...state.data.romDays.filter((r) => r.date !== action.rom.date), action.rom] })
    case 'upsertExercise':
      return upsertExercise(state, action.exercise)
    case 'removeExercise':
      return withData(state, { exercises: (state.data.exercises ?? []).filter((e) => e.id !== action.id) })
    case 'togglePlanMark':
      return togglePlanMark(state, action.date, action.itemId)
    case 'addJournal':
      return withData(state, { journal: [...(state.data.journal ?? []), action.entry] })
    case 'warningFeedback':
      return withData(state, { warningFeedback: [...(state.data.warningFeedback ?? []), action.feedback] })
    default:
      return state
  }
}

export function rootReducer(root: RootState, action: Action): RootState {
  switch (action.type) {
    case 'hydrate':
      return action.root
    case 'setMode':
      return { ...root, mode: action.mode }
    case 'reseedSample':
      return { ...root, sample: initialSample(action.today) }
    case 'deleteMyData':
      return { ...root, mode: 'real', real: initialReal(action.today) }
    default:
      return { ...root, [root.mode]: reducer(active(root), action) }
  }
}
