import type { ActivityLog, Dataset, Doing, Intensity, ManualActivity, MorningCheckIn, PainLog, Profile, Settled, Swelling } from '@kinn/core'
import { seedDataset } from '@kinn/core'

export interface AppState {
  readonly onboarded: boolean
  readonly seededFor: string
  readonly data: Dataset
  readonly ptReminder: boolean
}

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'reseed'; today: string }
  | { type: 'setProfile'; profile: Profile }
  | { type: 'useSample' }
  | { type: 'addActivity'; date: string; activity: ManualActivity; intensity: Intensity; id: string }
  | { type: 'addPain'; date: string; t: number; pain: number; doing: Doing | undefined; id: string }
  | { type: 'answerSettle'; id: string; settled: Settled; t: number }
  | { type: 'setCheckIn'; date: string; pain: number; swelling: Swelling }
  | { type: 'setPtReminder'; on: boolean }

export const initialState = (today: string): AppState => ({
  onboarded: false,
  seededFor: today,
  data: seedDataset(today),
  ptReminder: true,
})

const isSeed = (id: string): boolean => id.startsWith('seed-')

/** True when the athlete has added nothing of their own, so the seed can safely move with the calendar. */
export const onlySeedData = (data: Dataset): boolean =>
  data.activityLogs.every((l) => isSeed(l.id)) && data.painLogs.every((p) => isSeed(p.id))

const withData = (state: AppState, data: Partial<Dataset>): AppState => ({ ...state, data: { ...state.data, ...data } })

const upsertCheckIn = (checkIns: readonly MorningCheckIn[], next: MorningCheckIn): readonly MorningCheckIn[] => [
  ...checkIns.filter((c) => c.date !== next.date),
  next,
]

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state
    case 'reseed':
      return { ...state, seededFor: action.today, data: { ...seedDataset(action.today), profile: state.data.profile } }
    case 'setProfile':
      return { ...withData(state, { profile: action.profile }), onboarded: true }
    case 'useSample':
      return { ...state, onboarded: true }
    case 'addActivity': {
      const log: ActivityLog = { id: action.id, date: action.date, activity: action.activity, intensity: action.intensity }
      return withData(state, { activityLogs: [...state.data.activityLogs, log] })
    }
    case 'addPain': {
      const base = { id: action.id, t: action.t, date: action.date, pain: action.pain }
      const log: PainLog = action.doing ? { ...base, doing: action.doing } : base
      return withData(state, { painLogs: [...state.data.painLogs, log] })
    }
    case 'answerSettle':
      return withData(state, {
        painLogs: state.data.painLogs.map((p) => (p.id === action.id ? { ...p, settled: action.settled, settledAt: action.t } : p)),
      })
    case 'setCheckIn':
      return withData(state, {
        checkIns: upsertCheckIn(state.data.checkIns, { date: action.date, pain: action.pain, swelling: action.swelling }),
      })
    case 'setPtReminder':
      return { ...state, ptReminder: action.on }
  }
}
