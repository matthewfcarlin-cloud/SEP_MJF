/**
 * The phone's link to the RECO server. Nothing here runs until the person turns on sharing:
 * with no session there is no upload, and "nothing leaves the phone" stays true.
 *
 * The session token is kept in the Keychain (expo-secure-store), never in plain app storage.
 * If the Keychain isn't available in this build, sharing reports itself unavailable instead of
 * falling back to something weaker.
 */
import { createApiClient } from '@reco/core'
import type { ApiClient } from '@reco/core'
import { Platform } from 'react-native'

const TOKEN_KEY = 'reco.session.v1'

/** The server's address for this build, or undefined when the build has none. */
export function apiUrl(): string | undefined {
  const raw = process.env.EXPO_PUBLIC_API_URL
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim().replace(/\/+$/, '') : undefined
}

interface TokenStore {
  get(): Promise<string | undefined>
  set(token: string): Promise<void>
  clear(): Promise<void>
}

/** The browser build keeps the session for the tab only. */
const webStore: TokenStore = {
  get: async () => globalThis.sessionStorage?.getItem(TOKEN_KEY) ?? undefined,
  set: async (token) => globalThis.sessionStorage?.setItem(TOKEN_KEY, token),
  clear: async () => globalThis.sessionStorage?.removeItem(TOKEN_KEY),
}

async function keychainStore(): Promise<TokenStore | undefined> {
  try {
    const SecureStore = await import('expo-secure-store')
    if (!(await SecureStore.isAvailableAsync())) return undefined
    const options = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY }
    return {
      get: async () => (await SecureStore.getItemAsync(TOKEN_KEY, options)) ?? undefined,
      set: (token) => SecureStore.setItemAsync(TOKEN_KEY, token, options),
      clear: () => SecureStore.deleteItemAsync(TOKEN_KEY, options),
    }
  } catch (error) {
    console.warn('RECO: secure storage is not in this build, so sharing is off.', error)
    return undefined
  }
}

let store: Promise<TokenStore | undefined> | undefined
const tokens = (): Promise<TokenStore | undefined> => (store ??= Platform.OS === 'web' ? Promise.resolve(webStore) : keychainStore())

/** True when this build can share at all: it has a server address and somewhere safe for the session. */
export async function sharingAvailable(): Promise<boolean> {
  return apiUrl() !== undefined && (await tokens()) !== undefined
}

/**
 * The session in memory, kept in step with the Keychain. Every client reads it at the moment of
 * each request, so signing out and in again can never leave a screen holding the old session.
 */
let current: string | undefined
let read = false

export async function loadToken(): Promise<string | undefined> {
  if (!read) {
    current = await (await tokens())?.get()
    read = true
  }
  return current
}

export async function saveToken(token: string): Promise<void> {
  const t = await tokens()
  if (!t) throw new Error('RECO: no secure storage for the session')
  await t.set(token)
  current = token
  read = true
}

export async function clearToken(): Promise<void> {
  current = undefined
  read = true
  await (await tokens())?.clear()
}

/**
 * A client for this build's server, signed in as whoever holds the session when each request is
 * made (call loadToken once first). Throws if the build has no server, which callers check first.
 */
export function phoneApi(): ApiClient {
  const baseUrl = apiUrl()
  if (!baseUrl) throw new Error('RECO: this build has no server address')
  return createApiClient({ baseUrl, fetch: (input, init) => fetch(input, init), token: () => current })
}
