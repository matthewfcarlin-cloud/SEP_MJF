/**
 * What leaves the phone, and what a PT gets to see of it. Two cuts, both pure:
 * `uploadableDataset` drops what must never be uploaded, `scopedDataset` keeps only what the
 * patient chose to share. The server runs the second on every read, so an unshared part never
 * reaches the clinic site at all.
 */
import type { Dataset, PainLog, Profile } from '../manual/types'
import type { ShareScope } from './types'

const withoutLocalFiles = (p: PainLog): PainLog => {
  const { voiceUri: _voice, photoUri: _photo, ...rest } = p
  return rest
}

/**
 * The record as it is uploaded. Voice notes and photos are files on the phone and stay there;
 * the PT's plan lives on the server already; "that was wrong" taps on warnings are pilot
 * feedback for the person's own line, not part of what a PT reads.
 */
export function uploadableDataset(data: Dataset): Dataset {
  const { ptPlan: _plan, warningFeedback: _feedback, ...rest } = data
  return { ...rest, painLogs: data.painLogs.map(withoutLocalFiles) }
}

const basicProfile = (p: Profile, has: (s: ShareScope) => boolean): Profile => {
  const { story: _story, otherKnee: _otherKnee, ptEmail: _ptEmail, ...basics } = p
  return {
    ...basics,
    ...(has('notes') && p.story !== undefined ? { story: p.story } : {}),
    ...(has('range') && p.otherKnee !== undefined ? { otherKnee: p.otherKnee } : {}),
  }
}

const withoutNote = (p: PainLog): PainLog => {
  const { note: _note, ...rest } = p
  return rest
}

/**
 * The record cut down to a share's scopes. Always kept: the profile basics, morning check-ins,
 * the protocol path and any plan the patient typed in. Never kept: which exercises were ticked off.
 */
export function scopedDataset(data: Dataset, scopes: readonly ShareScope[]): Dataset {
  const has = (s: ShareScope): boolean => scopes.includes(s)
  const pain = has('pain') ? data.painLogs.map(withoutLocalFiles).map((p) => (has('notes') ? p : withoutNote(p))) : []
  return {
    profile: basicProfile(data.profile, has),
    checkIns: data.checkIns,
    activityLogs: has('activity') ? data.activityLogs : [],
    painLogs: pain,
    romDays: has('range') ? data.romDays : [],
    ...(data.path !== undefined ? { path: data.path } : {}),
    ...(data.exercises !== undefined ? { exercises: data.exercises } : {}),
    ...(has('range') && data.measurements !== undefined ? { measurements: data.measurements } : {}),
    ...(has('range') && data.bendCalibration !== undefined ? { bendCalibration: data.bendCalibration } : {}),
    ...(has('pain') && data.eveningChecks !== undefined ? { eveningChecks: data.eveningChecks } : {}),
    ...(has('notes') && data.journal !== undefined ? { journal: data.journal } : {}),
    ...(has('tape') && data.bendAlerts !== undefined ? { bendAlerts: data.bendAlerts } : {}),
  }
}
