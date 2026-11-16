/**
 * Real patients, as the server hands them over: each record already cut down to what that
 * patient chose to share. Summaries come from the same core function the sample caseload uses.
 */
import { caseloadOrder, patientSummary, SHARE_SCOPES } from '@reco/core'
import type { PatientSummary, SharedPatient, ShareScope } from '@reco/core'

/** Someone who has accepted the sharing code but whose phone hasn't sent a record yet. */
export interface WaitingPatient {
  readonly id: string
  readonly name: string
  readonly sharedSince: string
  /** The stored record could not be opened on the server. */
  readonly unreadable: boolean
}

export interface LiveCaseload {
  readonly patients: readonly PatientSummary[]
  readonly waiting: readonly WaitingPatient[]
  /** What each patient shares, by patient id. */
  readonly scopes: Readonly<Record<string, readonly ShareScope[]>>
}

export function liveCaseload(today: string, shared: readonly SharedPatient[]): LiveCaseload {
  const patients = caseloadOrder(shared.flatMap((p) => (p.data ? [patientSummary(p.id, p.data, today)] : [])))
  const waiting = shared.filter((p) => !p.data).map((p) => ({ id: p.id, name: p.name, sharedSince: p.sharedSince, unreadable: p.unreadable === true }))
  return { patients, waiting, scopes: Object.fromEntries(shared.map((p) => [p.id, p.scopes])) }
}

/** The scopes a patient left off, in the fixed order, so the page can say what it is not showing. */
export const notShared = (scopes: readonly ShareScope[]): readonly ShareScope[] => SHARE_SCOPES.filter((s) => !scopes.includes(s))

/** "ABCD EFGH": a sharing code as it is read out or copied down. */
export const spacedCode = (code: string): string => code.replace(/(.{4})(?=.)/g, '$1 ')
