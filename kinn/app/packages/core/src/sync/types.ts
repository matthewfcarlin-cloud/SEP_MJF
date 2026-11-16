/**
 * What crosses the wire between the apps and the RECO server. The server stores facts only:
 * accounts, the patient's own record, who they share it with, and every published plan version.
 * Everything a screen shows is still derived in the apps by the functions in this package.
 */
import type { Dataset } from '../manual/types'
import type { RecoveryPlan } from '../plan/recovery'

export type AccountRole = 'patient' | 'pt'

/** Length of the emailed sign-in code. Eight digits, so guessing one within its few allowed tries is a one-in-millions chance. */
export const SIGN_IN_CODE_DIGITS = 8

export interface Account {
  readonly id: string
  readonly email: string
  readonly role: AccountRole
  /** How the other side sees them: "Dana Ruiz, PT" or a first name. */
  readonly name: string
}

/**
 * The parts of a record a patient can choose to share with a PT, on top of the basics every
 * share carries (profile, morning check-ins, where they are on the protocol, a plan they typed in).
 * Which exercises were ticked off is never shared: the PT side is about the knee, not about checking up.
 */
export type ShareScope = 'range' | 'pain' | 'activity' | 'notes' | 'tape'

export const SHARE_SCOPES: readonly ShareScope[] = ['range', 'pain', 'activity', 'notes', 'tape']

/** Notes are the person's own words, so they start off. */
export const DEFAULT_SHARE_SCOPES: readonly ShareScope[] = ['range', 'pain', 'activity', 'tape']

export const isShareScope = (x: unknown): x is ShareScope => typeof x === 'string' && (SHARE_SCOPES as readonly string[]).includes(x)

/** A share as the patient sees it. */
export interface ShareView {
  readonly id: string
  readonly pt: { readonly name: string; readonly email: string }
  readonly scopes: readonly ShareScope[]
  /** ISO time the patient turned it on. */
  readonly since: string
}

/** Who a sharing code belongs to, shown to the patient before they agree. */
export interface InvitePreview {
  readonly pt: { readonly name: string; readonly email: string }
}

export interface InviteView {
  readonly code: string
  /** ISO time. */
  readonly expiresAt: string
}

export type AccessAction = 'viewed' | 'published-plan'

/** One line of the patient's "who looked" list. */
export interface AccessEntry {
  readonly ptName: string
  readonly action: AccessAction
  /** ISO time. */
  readonly at: string
}

/** One patient as the server hands them to their PT: the record, cut down to what was shared. */
export interface SharedPatient {
  readonly id: string
  /** The name on their record, or on their account until the phone has synced. */
  readonly name: string
  readonly sharedSince: string
  readonly scopes: readonly ShareScope[]
  /** ISO time the record last changed. Missing until the phone has synced once. */
  readonly updatedAt?: string
  /** Missing until the phone has synced once. Carries the latest published plan as `ptPlan`. */
  readonly data?: Dataset
  /** The stored record could not be opened. Rare, and a matter for the RECO team, not the patient. */
  readonly unreadable?: boolean
}

export interface StoredDataset {
  readonly revision: number
  readonly data: Dataset
  readonly updatedAt: string
}

export interface PublishedPlan {
  readonly plan: RecoveryPlan
  /** ISO time the server accepted it. */
  readonly publishedAt: string
}

/** Every response has this shape. */
export type ApiResponse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string; readonly code: ApiErrorCode }

export type ApiErrorCode =
  | 'bad-request'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'too-many-requests'
  | 'too-large'
  | 'unavailable'
  | 'server-error'
