/**
 * Every clinician-facing string. A PT's voice: "patient" is fine here (unlike the patient
 * app), but the rest of core's banned list still applies, checked by copy.test.ts. Nothing
 * here counts what a patient did or didn't do, and nothing makes the clinical call.
 */
import type { FlagSource, FlagTier, MeasuredBy, MorningMark, PathState } from '@reco/core'

export const copy = {
  appName: 'RECO',
  appSub: 'for clinicians',
  listTitle: 'Your patients',
  sampleTag: 'Sample data',
  sampleNote: 'Six sample patients. No real patient data is on this page.',
  listCount: (n: number) => `${n} patients`,
  nothingNew: 'Nothing new',
  week: (weeks: number) => `wk ${Math.floor(weeks)}`,
  phaseShort: (n: number, total: number) => `phase ${n} of ${total}`,
  pickOne: 'Pick a patient to see their progress, next steps and week.',
  back: 'All patients',

  tier: { 'contact-soon': 'Contact soon', 'worth-a-look': 'Worth a look', note: 'Note' } satisfies Record<FlagTier, string>,
  source: { 'check-in': 'check-in', 'pain-log': 'pain log', tape: 'tape', checkpoints: 'checkpoints' } satisfies Record<FlagSource, string>,
  flagsTitle: 'Flags',
  noFlags: 'No flags from the last few days of check-ins, pain logs or the tape.',

  progressTitle: 'Progress',
  state: {
    working: 'Working on checkpoints',
    'ready-waiting-on-time': 'Checkpoints met, waiting on healing time',
    ready: 'Moving to the next phase',
    'behind-typical': 'Past the typical window',
    'needs-pt': 'Waiting on your in-clinic checks',
    complete: 'Every checkpoint met',
  } satisfies Record<PathState, string>,
  checkpoints: (met: number, required: number) => `${met} of ${required} checkpoints`,
  ringLabel: (met: number, required: number) => `${met} of ${required} checkpoints met`,
  bend: 'Bend',
  straight: 'Straightening',
  otherKnee: (deg: number) => `Other knee ${deg}°`,
  fullyStraight: 'Fully straight',
  shortOf: (deg: number) => `${deg}° short`,
  noRange: 'No range measured yet',
  measured: (when: string) => `Measured ${when}`,
  planPhase: (name: string) => `Exercise plan: ${name}`,
  heldBack: 'held back a phase after recent flare-ups',
  bendLimit: (deg: number) => `Bend limit ${deg}°`,
  noProtocol: 'No checkpoint protocol for this injury',

  nextTitle: 'Next steps',
  forClinic: 'For you at the next visit',
  allMet: 'Every checkpoint in this phase is met.',
  by: { tape: 'Tape', 'self-test': 'Self-test', 'check-in': 'Check-in', pt: 'Clinic' } satisfies Record<MeasuredBy, string>,
  blocked: 'Waits for the bend limit to be lifted',

  weekTitle: 'This week',
  weekRange: (start: string, end: string) => `${start} to ${end}`,
  morning: { clear: 'Clear morning', some: 'Some pain or swelling', flare: 'Flare-up', none: 'No check-in' } satisfies Record<MorningMark, string>,
  peakBend: 'Deepest bend',
  bestStraight: 'Best straightening',
  flareMornings: 'Flare-up mornings',
  painLogs: 'Pain logs',
  logged: 'What they logged',
  nothingLogged: 'Nothing logged',
  lastCheckIn: (when: string, pain: number, swelling: string) => `Last check-in ${when}: pain ${pain}, swelling ${swelling}`,
  swelling: { none: 'none', some: 'some', 'a-lot': 'a lot' },

  footer: 'Sample data only. RECO shows what the patient recorded. What it means clinically is your call.',
} as const
