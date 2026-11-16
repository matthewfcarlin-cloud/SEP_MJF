/**
 * The typed client both apps use to talk to the RECO server. It holds no state: the caller
 * passes the session token, so the phone can keep it in the Keychain and the clinic site in
 * the tab's session storage. `fetch` is injected, which is also how the server's tests drive
 * the real routes through this client.
 */
import type { Dataset } from '../manual/types'
import type { RecoveryPlan } from '../plan/recovery'
import type {
  AccessEntry, Account, AccountRole, ApiErrorCode, ApiResponse, InvitePreview, InviteView, PublishedPlan, ShareScope, SharedPatient, ShareView, StoredDataset,
} from './types'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export type FetchLike = (input: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{ status: number; json(): Promise<unknown> }>

export interface ApiClientOptions {
  /** The server's address, without a trailing slash. */
  readonly baseUrl: string
  readonly fetch: FetchLike
  /** Returns the current session token, if signed in. */
  readonly token?: () => string | undefined
}

const UNREACHABLE = 'RECO’s server could not be reached. Check your connection and try again.'

const isEnvelope = (x: unknown): x is ApiResponse<unknown> => typeof x === 'object' && x !== null && typeof (x as { success?: unknown }).success === 'boolean'

export interface ApiClient {
  startSignIn(email: string, role: AccountRole): Promise<{ readonly sent: true; readonly devCode?: string }>
  verifySignIn(input: { email: string; code: string; role: AccountRole; name?: string }): Promise<{ readonly token: string; readonly account: Account }>
  signOut(): Promise<void>
  me(): Promise<Account>
  rename(name: string): Promise<Account>
  deleteAccount(): Promise<void>
  // patient
  getDataset(): Promise<StoredDataset | null>
  putDataset(baseRevision: number, data: Dataset): Promise<{ readonly revision: number }>
  shares(): Promise<readonly ShareView[]>
  previewInvite(code: string): Promise<InvitePreview>
  acceptInvite(code: string, scopes: readonly ShareScope[]): Promise<ShareView>
  setShareScopes(shareId: string, scopes: readonly ShareScope[]): Promise<ShareView>
  revokeShare(shareId: string): Promise<void>
  myPlan(): Promise<PublishedPlan | null>
  accessLog(): Promise<readonly AccessEntry[]>
  // pt
  createInvite(): Promise<InviteView>
  patients(): Promise<readonly SharedPatient[]>
  plans(patientId: string): Promise<readonly PublishedPlan[]>
  publishPlan(patientId: string, plan: RecoveryPlan): Promise<PublishedPlan>
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const call = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
    const token = options.token?.()
    let response: Awaited<ReturnType<FetchLike>>
    let parsed: unknown
    try {
      response = await options.fetch(`${options.baseUrl}${path}`, {
        method,
        headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      })
      parsed = await response.json()
    } catch {
      throw new ApiError(0, 'unavailable', UNREACHABLE)
    }
    if (!isEnvelope(parsed)) throw new ApiError(response.status, 'server-error', UNREACHABLE)
    if (!parsed.success) throw new ApiError(response.status, parsed.code, parsed.error)
    return parsed.data as T
  }
  const id = encodeURIComponent
  return {
    startSignIn: (email, role) => call('POST', '/v1/auth/start', { email, role }),
    verifySignIn: (input) => call('POST', '/v1/auth/verify', input),
    signOut: () => call('POST', '/v1/auth/logout'),
    me: () => call('GET', '/v1/me'),
    rename: (name) => call('PATCH', '/v1/me', { name }),
    deleteAccount: () => call('DELETE', '/v1/me'),
    getDataset: () => call('GET', '/v1/me/dataset'),
    putDataset: (baseRevision, data) => call('PUT', '/v1/me/dataset', { baseRevision, data }),
    shares: () => call('GET', '/v1/me/shares'),
    previewInvite: (code) => call('POST', '/v1/me/shares/preview', { code }),
    acceptInvite: (code, scopes) => call('POST', '/v1/me/shares', { code, scopes }),
    setShareScopes: (shareId, scopes) => call('PATCH', `/v1/me/shares/${id(shareId)}`, { scopes }),
    revokeShare: (shareId) => call('DELETE', `/v1/me/shares/${id(shareId)}`),
    myPlan: () => call('GET', '/v1/me/plan'),
    accessLog: () => call('GET', '/v1/me/access-log'),
    createInvite: () => call('POST', '/v1/invites'),
    patients: () => call('GET', '/v1/patients'),
    plans: (patientId) => call('GET', `/v1/patients/${id(patientId)}/plans`),
    publishPlan: (patientId, plan) => call('POST', `/v1/patients/${id(patientId)}/plans`, { plan }),
  }
}
