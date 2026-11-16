/**
 * Keeps the server's copy of the record current while the person is signed in, and brings the
 * PT's plan down. It runs a few seconds after the record changes and whenever the app comes to
 * the front. Signed out, it does nothing at all.
 */
import { ApiError, planChanged, syncOnce, uploadFingerprint } from '@reco/core'
import type { Dataset, PhoneSync, RecoveryPlan } from '@reco/core'
import { useEffect, useRef } from 'react'
import { AppState as NativeAppState } from 'react-native'

import { clearToken, loadToken, phoneApi } from './session'

const SETTLE_MS = 4000
const RETRY_MS = 30_000

interface SyncLoopInput {
  readonly enabled: boolean
  readonly sync: PhoneSync | undefined
  readonly data: Dataset
  /** Results name the account they belong to; the store ignores one for an account that has since signed out. */
  readonly onRevision: (accountId: string, revision: number) => void
  readonly onPlan: (accountId: string, plan: RecoveryPlan | undefined) => void
  /** The server no longer accepts the session (it ended, or the account was deleted elsewhere). */
  readonly onSignedOut: () => void
}

export function useSyncLoop({ enabled, sync, data, onRevision, onPlan, onSignedOut }: SyncLoopInput): void {
  // The latest values, for a pass that starts after a delay. Updated in an effect, read only in callbacks.
  const latest = useRef({ sync, data, onRevision, onPlan, onSignedOut })
  useEffect(() => {
    latest.current = { sync, data, onRevision, onPlan, onSignedOut }
  })
  // What was last sent, and for whom: a new sign-in always starts with an upload.
  const sent = useRef<{ accountId: string; fingerprint: string } | undefined>(undefined)
  const running = useRef(false)
  const again = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const signedIn = enabled && sync !== undefined
  const accountId = sync?.account.id

  const pass = async (): Promise<void> => {
    const now = latest.current
    if (running.current || !now.sync) return
    running.current = true
    const account = now.sync.account.id
    const stillSignedIn = (): boolean => latest.current.sync?.account.id === account
    let retryIn: number | undefined
    try {
      const token = await loadToken()
      if (!token) return now.onSignedOut()
      const fingerprint = uploadFingerprint(now.data)
      // Revision 0 means this sign-in has never sent anything, whatever an earlier session sent.
      const last = now.sync.revision > 0 && sent.current?.accountId === account ? sent.current.fingerprint : undefined
      const result = await syncOnce(phoneApi(), now.data, now.sync.revision, last)
      // The person may have signed out, or in as someone else, while the request was away.
      if (!stillSignedIn()) return
      sent.current = { accountId: account, fingerprint }
      if (result.revision !== now.sync.revision) now.onRevision(account, result.revision)
      if (planChanged(now.data.ptPlan, result.plan)) now.onPlan(account, result.plan)
      // Anything logged while this pass was away still needs sending.
      if (uploadFingerprint(latest.current.data) !== fingerprint) retryIn = SETTLE_MS
    } catch (error) {
      if (!stillSignedIn()) return
      if (error instanceof ApiError && error.status === 401) {
        await clearToken()
        now.onSignedOut()
      } else {
        // Offline or a server hiccup: the record is still on the phone, and another pass follows.
        console.warn('RECO: sync will try again shortly.', error)
        retryIn = RETRY_MS
      }
    } finally {
      running.current = false
      if (retryIn !== undefined) {
        clearTimeout(again.current)
        again.current = setTimeout(() => void pass(), retryIn)
      }
    }
  }

  // After the record changes, wait for the taps to settle, then send.
  useEffect(() => {
    if (!signedIn) return undefined
    const timer = setTimeout(() => void pass(), SETTLE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pass reads the latest values from the ref
  }, [signedIn, accountId, data])

  // Coming to the front checks for a new plan from the PT. Signing out cancels anything queued.
  useEffect(() => {
    if (!signedIn) return undefined
    void pass()
    const sub = NativeAppState.addEventListener('change', (next) => {
      if (next === 'active') void pass()
    })
    return () => {
      sub.remove()
      clearTimeout(again.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pass reads the latest values from the ref
  }, [signedIn, accountId])
}
