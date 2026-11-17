import type { WaitingPatient } from './live'

/** What surrounds the patients: the sample caseload, or the signed-in PT's own. */
export interface ClinicChrome {
  readonly mode: 'sample' | 'live'
  readonly accountName?: string
  readonly waiting?: readonly WaitingPatient[]
  readonly loading?: boolean
  readonly loadError?: string | undefined
  readonly onRetry?: () => void
  readonly onSignOut?: () => void
  /** In sample mode on a build that has a server: the way to your own patients. */
  readonly onSignIn?: () => void
}

export const SAMPLE_CHROME: ClinicChrome = { mode: 'sample' }
