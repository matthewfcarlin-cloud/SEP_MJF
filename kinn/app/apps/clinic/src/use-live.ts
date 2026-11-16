/**
 * Signing in and the live caseload. All state is replaced, never edited in place. A call the
 * server answers with "sign in again" ends the session here too.
 */
import { ApiError } from '@reco/core'
import type { InviteView, RecoveryPlan, SharedPatient } from '@reco/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { clinicApi, loadSession, saveSession } from './session'
import type { Session } from './session'

const REFRESH_AFTER_MS = 60_000

export interface Live {
  readonly session: Session | undefined
  /** Undefined until the first load finishes. */
  readonly shared: readonly SharedPatient[] | undefined
  readonly loadError: string | undefined
  startSignIn(email: string): Promise<{ readonly devCode?: string }>
  verifySignIn(email: string, code: string): Promise<void>
  rename(name: string): Promise<void>
  signOut(): Promise<void>
  refresh(): Promise<void>
  publish(patientId: string, plan: RecoveryPlan): Promise<void>
  createInvite(): Promise<InviteView>
}

export const messageOf = (error: unknown): string => (error instanceof Error ? error.message : 'Something went wrong. Try again.')

export function useLive(baseUrl: string): Live {
  const [session, setSession] = useState<Session | undefined>(() => (typeof window === 'undefined' ? undefined : loadSession()))
  const [shared, setShared] = useState<readonly SharedPatient[] | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [loadedAt, setLoadedAt] = useState(0)
  const token = session?.token
  const api = useMemo(() => clinicApi(baseUrl, token), [baseUrl, token])

  // Each sign-in or sign-out starts a new epoch; a response from an earlier one is dropped, so one
  // PT's caseload can never land on the next PT's screen.
  const epoch = useRef(0)

  const keep = useCallback((next: Session | undefined) => {
    epoch.current += 1
    saveSession(next)
    setSession(next)
    setLoadError(undefined)
    if (!next) {
      setShared(undefined)
      // The open patient belonged to the session that just ended.
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  /** Runs a signed-in call; an expired session drops back to the sign-in page. */
  const guarded = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    try {
      return await work()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) keep(undefined)
      throw error
    }
  }, [keep])

  const refresh = useCallback(async () => {
    const started = epoch.current
    try {
      const patients = await guarded(() => api.patients())
      if (epoch.current !== started) return
      setShared(patients)
      setLoadError(undefined)
    } catch (error) {
      if (epoch.current === started) setLoadError(messageOf(error))
    } finally {
      if (epoch.current === started) setLoadedAt(Date.now())
    }
  }, [api, guarded])

  useEffect(() => {
    if (token) void refresh()
  }, [token, refresh])

  // Coming back to the tab picks up what patients' phones have synced since.
  useEffect(() => {
    if (!token) return undefined
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - loadedAt > REFRESH_AFTER_MS) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [token, loadedAt, refresh])

  return {
    session,
    shared,
    loadError,
    refresh,
    startSignIn: async (email) => {
      const { devCode } = await api.startSignIn(email, 'pt')
      return devCode !== undefined ? { devCode } : {}
    },
    verifySignIn: async (email, code) => {
      keep(await api.verifySignIn({ email, code, role: 'pt' }))
    },
    rename: async (name) => {
      if (!session) return
      const account = await guarded(() => api.rename(name))
      keep({ token: session.token, account })
    },
    signOut: async () => {
      try {
        await api.signOut()
      } catch (error) {
        // The tab forgets the session either way; the server ends it by itself within the day.
        console.warn('RECO: the server could not be told about the sign-out.', error)
      }
      keep(undefined)
    },
    publish: async (patientId, plan) => {
      await guarded(() => api.publishPlan(patientId, plan))
      await refresh()
    },
    createInvite: () => guarded(() => api.createInvite()),
  }
}
