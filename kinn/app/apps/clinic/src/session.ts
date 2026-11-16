/**
 * The clinic site's link to the RECO server. With VITE_API_URL unset the site runs on sample
 * patients only, exactly as before. The session lives in this tab's session storage, so closing
 * the tab signs the PT out; the server also ends it after one working day.
 */
import { createApiClient } from '@reco/core'
import type { Account, ApiClient } from '@reco/core'

const KEY = 'reco.clinic.session.v1'

export interface Session {
  readonly token: string
  readonly account: Account
}

/** The server's address, or undefined when this build has none (sample data only). */
export function apiUrl(): string | undefined {
  const raw: unknown = import.meta.env.VITE_API_URL
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim().replace(/\/+$/, '') : undefined
}

const isSession = (x: unknown): x is Session =>
  typeof x === 'object' && x !== null && typeof (x as Session).token === 'string' && typeof (x as Session).account?.id === 'string' && (x as Session).account.role === 'pt'

export function loadSession(): Session | undefined {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : undefined
    return isSession(parsed) ? parsed : undefined
  } catch (error) {
    console.warn('RECO: the saved sign-in could not be read.', error)
    return undefined
  }
}

export function saveSession(session: Session | undefined): void {
  try {
    if (session) window.sessionStorage.setItem(KEY, JSON.stringify(session))
    else window.sessionStorage.removeItem(KEY)
  } catch (error) {
    console.warn('RECO: the sign-in could not be kept for this tab.', error)
  }
}

export function clinicApi(baseUrl: string, token?: string): ApiClient {
  return createApiClient({ baseUrl, fetch: (input, init) => window.fetch(input, init), token: () => token })
}
