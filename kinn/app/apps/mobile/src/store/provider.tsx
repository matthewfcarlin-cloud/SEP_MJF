import AsyncStorage from '@react-native-async-storage/async-storage'
import { dayKey, deriveToday } from '@kinn/core'
import type { Doing, Intensity, ManualActivity, Profile, Settled, Swelling, TodayView } from '@kinn/core'
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { initialState, onlySeedData, reducer } from './state'
import type { AppState } from './state'

const STORAGE_KEY = 'kinn.state.v1'

const newId = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export interface Store {
  readonly state: AppState
  readonly today: string
  readonly view: TodayView
  readonly ready: boolean
  readonly setProfile: (profile: Profile) => void
  readonly startWithSample: () => void
  readonly addActivity: (activity: ManualActivity, intensity: Intensity) => void
  readonly addPain: (pain: number, doing: Doing | undefined) => string
  readonly answerSettle: (id: string, settled: Settled) => void
  readonly setCheckIn: (pain: number, swelling: Swelling) => void
  readonly setPtReminder: (on: boolean) => void
  readonly resetToSample: () => void
}

const StoreContext = createContext<Store | undefined>(undefined)

async function loadState(today: string): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState(today)
    const stored = JSON.parse(raw) as AppState
    const stale = stored.seededFor !== today && onlySeedData(stored.data)
    return stale ? reducer(stored, { type: 'reseed', today }) : stored
  } catch (error) {
    console.warn('Kinn: could not load saved state, starting from the sample.', error)
    return initialState(today)
  }
}

export function StoreProvider({ children }: { readonly children: ReactNode }) {
  const [today] = useState(() => dayKey(Date.now()))
  const [state, dispatch] = useReducer(reducer, today, initialState)
  const [ready, setReady] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    let cancelled = false
    loadState(today).then((loaded) => {
      if (cancelled) return
      dispatch({ type: 'hydrate', state: loaded })
      hydrated.current = true
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [today])

  useEffect(() => {
    if (!hydrated.current) return
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error: unknown) =>
      console.warn('Kinn: could not save state.', error),
    )
  }, [state])

  const view = useMemo(() => deriveToday(state.data, today), [state.data, today])

  const addPain = useCallback(
    (pain: number, doing: Doing | undefined): string => {
      const id = newId('pain')
      dispatch({ type: 'addPain', id, date: today, t: Date.now(), pain, doing })
      return id
    },
    [today],
  )

  const store = useMemo<Store>(
    () => ({
      state,
      today,
      view,
      ready,
      setProfile: (profile) => dispatch({ type: 'setProfile', profile }),
      startWithSample: () => dispatch({ type: 'useSample' }),
      addActivity: (activity, intensity) => dispatch({ type: 'addActivity', id: newId('act'), date: today, activity, intensity }),
      addPain,
      answerSettle: (id, settled) => dispatch({ type: 'answerSettle', id, settled, t: Date.now() }),
      setCheckIn: (pain, swelling) => dispatch({ type: 'setCheckIn', date: today, pain, swelling }),
      setPtReminder: (on) => dispatch({ type: 'setPtReminder', on }),
      resetToSample: () => dispatch({ type: 'reseed', today }),
    }),
    [state, today, view, ready, addPain],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
