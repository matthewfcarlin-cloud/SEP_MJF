import AsyncStorage from '@react-native-async-storage/async-storage'
import { dayKey, deriveToday, nextPathRecord } from '@reco/core'
import type { BendAlert, Doing, EffusionGrade, EveningWord, GuidanceLevel, Intensity, JournalEntry, ManualActivity, PathMeasurement, PlanExercise, Profile, RomDay, SampleChoice, Settled, Swelling, TodayView } from '@reco/core'
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { AppState as NativeAppState, Platform } from 'react-native'
import type { ReactNode } from 'react'

import { removeFiles } from '@/files'
import { syncNotifications } from '@/notifications'
import { useTapeRecords } from '@/tape/tape-log'

import { active, initialRoot, initialSample, migrateReal, onlySeedData, rootReducer } from './state'
import type { AppState, DataMode, NotificationMode, PainPatch, PathOverrides, RootState } from './state'

/** The sample key moved to v2 when sample data became the protocol personas; v1 samples are simply rebuilt. */
const KEYS = { real: 'reco.state.v1', sample: 'reco.sample.v2', mode: 'reco.mode.v1' } as const

/** A real install starts on real data. The browser demo at /try has no real mode. */
const DEFAULT_MODE: DataMode = Platform.OS === 'web' ? 'sample' : 'real'

const newId = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export interface CompleteOnboarding {
  readonly profile: Profile
  readonly notifications: NotificationMode
  readonly consentAt: number
  readonly rom?: RomDay
  readonly exercises?: readonly PlanExercise[]
}

export interface Store {
  readonly mode: DataMode
  readonly state: AppState
  /** The real state, whatever mode is showing. */
  readonly real: AppState
  readonly today: string
  readonly view: TodayView
  readonly ready: boolean
  readonly setMode: (mode: DataMode) => void
  readonly completeOnboarding: (input: CompleteOnboarding) => void
  readonly updateProfile: (patch: Partial<Profile>) => void
  readonly deleteMyData: () => void
  readonly setGuidance: (guidance: GuidanceLevel) => void
  readonly setNotifications: (mode: NotificationMode) => void
  readonly markExported: () => void
  readonly dismissBackup: () => void
  readonly addActivity: (activity: ManualActivity, intensity: Intensity, date?: string) => void
  readonly removeActivity: (id: string) => void
  /** One tap: saves the time now, before any question. Returns the id for detail or undo. */
  readonly pressPain: () => string
  readonly addRatedPain: (pain: number, doing?: Doing, note?: string, date?: string) => void
  readonly updatePain: (id: string, patch: PainPatch) => void
  readonly removePain: (id: string) => void
  readonly answerSettle: (id: string, settled: Settled) => void
  readonly setCheckIn: (pain: number, swelling: Swelling, effusion?: EffusionGrade) => void
  readonly setEvening: (word: EveningWord) => void
  readonly addMeasurement: (rom: RomDay) => void
  readonly upsertExercise: (exercise: Omit<PlanExercise, 'id'> & { readonly id?: string }) => void
  readonly removeExercise: (id: string) => void
  readonly togglePlanMark: (itemId: string, date?: string) => void
  readonly addJournal: (text: string, source: JournalEntry['source']) => void
  readonly warningFeedback: (kind: 'wrong' | 'helpful') => void
  /** Checkpoint values from a self-test or the "From my PT" sheet, all dated today. */
  readonly addPathMeasurements: (entries: readonly Omit<PathMeasurement, 'date'>[]) => void
  readonly setPathOverrides: (overrides: PathOverrides) => void
  /** Sample mode debug menu: switch persona or move along their recovery. */
  readonly setSample: (choice: SampleChoice) => void
  /** The bend, in degrees, the person held at the tape's max calibration. undefined clears it. */
  readonly setBendMaxDeg: (maxDeg: number | undefined) => void
  readonly addBendAlert: (alert: BendAlert) => void
}

const StoreContext = createContext<Store | undefined>(undefined)

const parse = (raw: string | null | undefined): unknown => {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    console.warn('RECO: saved data could not be read.', error)
    return null
  }
}

function sampleFrom(stored: unknown, today: string): AppState {
  const s = stored as AppState | null
  if (!s?.data?.activityLogs) return initialSample(today)
  return s.seededFor !== today && onlySeedData(s.data) ? initialSample(today, s.sample) : s
}

async function loadRoot(today: string): Promise<RootState> {
  try {
    const [real, sample, mode] = await Promise.all([AsyncStorage.getItem(KEYS.real), AsyncStorage.getItem(KEYS.sample), AsyncStorage.getItem(KEYS.mode)])
    return {
      mode: Platform.OS === 'web' ? 'sample' : mode === 'sample' ? 'sample' : 'real',
      real: migrateReal(parse(real), today),
      sample: sampleFrom(parse(sample), today),
    }
  } catch (error) {
    console.warn('RECO: could not load saved state, starting empty.', error)
    return initialRoot(today, DEFAULT_MODE)
  }
}

const save = (key: string, value: string): void => {
  AsyncStorage.setItem(key, value).catch((error: unknown) => console.warn('RECO: could not save state.', error))
}

const localFiles = (state: AppState): readonly string[] =>
  state.data.painLogs.flatMap((p) => [p.voiceUri, p.photoUri]).filter((u): u is string => u !== undefined)

/** The day key follows the clock: the app can stay open overnight, and a new day must read as one. */
function useToday(): string {
  const [today, setToday] = useState(() => dayKey(Date.now()))
  useEffect(() => {
    const sub = NativeAppState.addEventListener('change', (next) => {
      if (next === 'active') setToday(dayKey(Date.now()))
    })
    return () => sub.remove()
  }, [])
  return today
}

export function StoreProvider({ children }: { readonly children: ReactNode }) {
  const today = useToday()
  const [root, dispatch] = useReducer(rootReducer, undefined, () => initialRoot(dayKey(Date.now()), DEFAULT_MODE))
  const [ready, setReady] = useState(false)
  const hydrated = useRef(false)
  const state = active(root)

  useEffect(() => {
    let cancelled = false
    loadRoot(dayKey(Date.now())).then((loaded) => {
      if (cancelled) return
      dispatch({ type: 'hydrate', root: loaded })
      hydrated.current = true
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (hydrated.current) save(KEYS.real, JSON.stringify(root.real))
  }, [root.real])
  useEffect(() => {
    if (hydrated.current) save(KEYS.sample, JSON.stringify(root.sample))
  }, [root.sample])
  useEffect(() => {
    if (hydrated.current) save(KEYS.mode, root.mode)
  }, [root.mode])

  useEffect(() => {
    if (ready && root.sample.seededFor !== today && onlySeedData(root.sample.data)) dispatch({ type: 'reseedSample', today })
  }, [ready, today, root.sample.seededFor, root.sample.data])

  // Once a day on open (and after new values), store a phase whose checkpoints and time floor are both met.
  // A sample about to be reseeded for the new day is skipped, so a stale path never lands on the fresh one.
  const staleSample = root.mode === 'sample' && state.seededFor !== today
  useEffect(() => {
    if (!ready || staleSample) return
    const next = nextPathRecord(state.data, today)
    if (next) dispatch({ type: 'setPath', path: next })
  }, [ready, staleSample, today, state.data])

  const { notifications } = root.real
  const { nextVisit } = root.real.data.profile
  useEffect(() => {
    if (ready) void syncNotifications(root.real.onboarded ? notifications : 'off', nextVisit)
  }, [ready, root.real.onboarded, notifications, nextVisit])

  const tapeRecords = useTapeRecords()
  // Real mode never shows a simulated or tape number in Phase A.
  const view = useMemo(() => deriveToday(state.data, today, root.mode === 'sample' ? tapeRecords : []), [state.data, today, root.mode, tapeRecords])

  const pressPain = useCallback((): string => {
    const id = newId('pain')
    dispatch({ type: 'addPress', id, date: dayKey(Date.now()), t: Date.now() })
    return id
  }, [])

  const realFiles = localFiles(root.real)
  const store = useMemo<Store>(
    () => ({
      mode: root.mode,
      state,
      real: root.real,
      today,
      view,
      ready,
      setMode: (mode) => dispatch({ type: 'setMode', mode }),
      completeOnboarding: (input) => dispatch({ type: 'completeOnboarding', ...input }),
      updateProfile: (patch) => dispatch({ type: 'updateProfile', patch }),
      deleteMyData: () => {
        removeFiles(realFiles)
        dispatch({ type: 'deleteMyData', today })
      },
      setGuidance: (guidance) => dispatch({ type: 'setGuidance', guidance }),
      setNotifications: (mode) => dispatch({ type: 'setNotifications', mode }),
      markExported: () => dispatch({ type: 'markExported', t: Date.now() }),
      dismissBackup: () => dispatch({ type: 'dismissBackup', t: Date.now() }),
      addActivity: (activity, intensity, date = today) => dispatch({ type: 'addActivity', id: newId('act'), date, activity, intensity }),
      removeActivity: (id) => dispatch({ type: 'removeActivity', id }),
      pressPain,
      addRatedPain: (pain, doing, note, date = today) =>
        dispatch({ type: 'addRatedPain', id: newId('pain'), date, t: Date.now(), pain, ...(doing ? { doing } : {}), ...(note ? { note } : {}) }),
      updatePain: (id, patch) => {
        // A replaced recording or photo should not stay behind on the phone.
        const old = state.data.painLogs.find((p) => p.id === id)
        const replaced = [patch.voiceUri !== undefined ? old?.voiceUri : undefined, patch.photoUri !== undefined ? old?.photoUri : undefined]
        removeFiles(replaced.filter((u): u is string => u !== undefined))
        dispatch({ type: 'updatePain', id, patch })
      },
      removePain: (id) => {
        const old = state.data.painLogs.find((p) => p.id === id)
        removeFiles([old?.voiceUri, old?.photoUri].filter((u): u is string => u !== undefined))
        dispatch({ type: 'removePain', id })
      },
      answerSettle: (id, settled) => dispatch({ type: 'answerSettle', id, settled, t: Date.now() }),
      setCheckIn: (pain, swelling, effusion) => dispatch({ type: 'setCheckIn', date: today, pain, swelling, ...(effusion ? { effusion } : {}) }),
      setEvening: (word) => dispatch({ type: 'setEvening', id: newId('pain'), date: today, t: Date.now(), word }),
      addMeasurement: (rom) => dispatch({ type: 'addMeasurement', rom }),
      upsertExercise: (exercise) => dispatch({ type: 'upsertExercise', exercise: { ...exercise, id: exercise.id ?? newId('ex') } }),
      removeExercise: (id) => dispatch({ type: 'removeExercise', id }),
      togglePlanMark: (itemId, date = today) => dispatch({ type: 'togglePlanMark', date, itemId }),
      addJournal: (text, source) => dispatch({ type: 'addJournal', entry: { id: newId('note'), t: Date.now(), date: today, text, source } }),
      warningFeedback: (kind) => dispatch({ type: 'warningFeedback', feedback: { date: today, t: Date.now(), kind } }),
      addPathMeasurements: (entries) => dispatch({ type: 'addPathMeasurements', measurements: entries.map((e) => ({ ...e, date: today })) }),
      setPathOverrides: (overrides) => dispatch({ type: 'setPathOverrides', overrides }),
      setSample: (choice) => dispatch({ type: 'setSample', today, choice }),
      setBendMaxDeg: (maxDeg) => dispatch({ type: 'setBendCalibration', calibration: maxDeg === undefined ? undefined : { maxDeg, date: today } }),
      addBendAlert: (alert) => dispatch({ type: 'addBendAlert', alert }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- realFiles is rebuilt from root.real, already listed
    [root.mode, root.real, state, today, view, ready, pressPain],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
