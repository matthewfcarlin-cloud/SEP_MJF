/**
 * One sync pass from the phone: send the record up, bring the PT's plan down. The phone holds
 * the facts, so when the server's copy has moved on (a reinstall, a second sign-in) the phone
 * reads the server's revision and saves over it. One device per person for now; merging two
 * phones' records is a later step.
 */
import type { Dataset } from '../manual/types'
import type { RecoveryPlan } from '../plan/recovery'
import { ApiError } from './client'
import type { ApiClient } from './client'
import { uploadableDataset } from './scope'

/** What the phone remembers about sharing. The session token itself lives in the Keychain, never here. */
export interface PhoneSync {
  readonly account: { readonly id: string; readonly email: string; readonly name: string }
  /** The server revision this phone last saw. */
  readonly revision: number
}

export interface RecordSyncResult {
  /** The server's revision after this pass. */
  readonly revision: number
  /** The latest plan a PT published to this person, if any. */
  readonly plan: RecoveryPlan | undefined
  /** False when the record was already up to date and only the plan was checked. */
  readonly uploaded: boolean
}

/** What the upload would contain, as text: compare with the last one sent to skip a pass that would change nothing. */
export const uploadFingerprint = (data: Dataset): string => JSON.stringify(uploadableDataset(data))

/**
 * @param revision the server revision this phone last saw (0 if it has never synced)
 * @param lastFingerprint the fingerprint of the last record sent, to skip an identical upload
 */
export async function syncOnce(api: ApiClient, data: Dataset, revision: number, lastFingerprint?: string): Promise<RecordSyncResult> {
  const upload = uploadableDataset(data)
  let next = revision
  const changed = lastFingerprint === undefined || JSON.stringify(upload) !== lastFingerprint
  if (changed) {
    try {
      next = (await api.putDataset(revision, upload)).revision
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'conflict') throw error
      const stored = await api.getDataset()
      next = (await api.putDataset(stored?.revision ?? 0, upload)).revision
    }
  }
  const published = await api.myPlan()
  return { revision: next, plan: published?.plan, uploaded: changed }
}

/** Whether the plan from the server differs from the one on the phone, so state only changes when it must. */
export const planChanged = (current: RecoveryPlan | undefined, incoming: RecoveryPlan | undefined): boolean =>
  current?.id !== incoming?.id || current?.version !== incoming?.version
