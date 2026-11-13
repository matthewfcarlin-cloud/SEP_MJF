/**
 * Path screen, self-tests and the "From my PT" sheet. Kept apart from copy.ts so each
 * file stays small; checked against the banned-words list by the same copy test.
 * Rules: RECO never clears anyone, projections are "at your current pace" and a range,
 * "behind typical" normalises and points to the PT, time floors are healing time.
 */
import { criterionValueWords, projectionWords } from '@reco/core'
import type { CriterionView, MeasuredBy, PathState, Projection } from '@reco/core'

const WEEK = 7

const valueWords = (c: CriterionView): string => criterionValueWords(c, 'patient')
const projectionInWords = (p: Projection | undefined): string | undefined => projectionWords(p, 'patient')

export const pathCopy = {
  back: 'Progress',
  title: 'Your path',
  cardLabel: 'Recovery path',
  cardOpen: 'See your path',
  phaseOf: (n: number, total: number) => `Phase ${n} of ${total}`,
  weekIn: (weeks: number) => `Week ${Math.floor(weeks)}`,
  ringLabel: (met: number, required: number) => `${met} of ${required} checkpoints met`,
  ringCenter: (met: number, required: number) => `${met}/${required}`,

  state: {
    working: 'Working on it',
    'ready-waiting-on-time': 'Checkpoints done',
    ready: 'Next phase unlocked',
    'behind-typical': 'Taking a bit longer',
    'needs-pt': 'For your PT',
    complete: 'Every checkpoint met',
  } satisfies Record<PathState, string>,

  limitTitle: (deg: number) => `Bend limit ${deg}°`,
  loadedLimitTitle: (deg: number) => `Weight-bearing bends to ${deg}°`,
  limitBy: { pt: 'Set by your surgeon or PT.', protocol: 'From your protocol. Your surgeon or PT can change it.' },
  limitAlerts: (n: number) => (n === 1 ? '1 bend past it in the last 7 days.' : `${n} bends past it in the last 7 days.`),
  limitTape: 'Your tape buzzes your phone when you go past it.',
  limitTapeSetup: 'Set up bend on the tape screen and your phone buzzes when you go past it.',

  otherKneeTitle: 'Measure your good knee first',
  otherKneeBody: 'Some checkpoints compare the two knees. Measure the other knee once and RECO keeps it.',
  otherKneeAction: 'Measure my other knee',

  checkpoints: 'Checkpoints for this phase',
  value: valueWords,
  projection: projectionInWords,
  blocked: 'Waits for your surgeon or PT to lift the bend limit.',
  by: { tape: 'Tape', 'self-test': 'You', 'check-in': 'Check-in', pt: 'PT' } satisfies Record<MeasuredBy, string>,
  byHint: { tape: 'Measured from your range', 'self-test': 'A 1-minute test you do', 'check-in': 'From your morning check-in', pt: 'Measured in clinic' } satisfies Record<MeasuredBy, string>,
  fromPt: 'Add numbers from my PT',

  timeline: 'All phases',
  done: (week: number) => `Done in week ${week}`,
  current: 'You are here',
  typical: (lo: number, hi: number) => `Typically weeks ${lo}–${hi}`,
  unlocks: 'What it opens up',

  source: (protocol: string) =>
    `Checkpoints from the Mass General Brigham ${protocol} protocol. Typical weeks are averages, not targets. Your PT can change any of this.`,
  sources: 'Sources',
  hideSources: 'Hide sources',
  notReviewed: 'Not yet reviewed by a PT.',

  alertsToday: (n: number, limit: number) => (n === 1 ? `1 bend past your ${limit}° limit today` : `${n} bends past your ${limit}° limit today`),
  alertsTodaySub: 'Easing back under it is enough. Your path shows the limit.',
} as const

export const selfTestCopy = {
  back: 'Your path',
  eyebrow: '1-minute test',
  save: 'Save',
  yes: 'Yes',
  no: 'Not yet',
  saved: 'Saved',
  notes: {
    slrNoLag: { title: 'Straight-leg raise', how: 'Lie on your back, tighten the thigh, and lift the leg to the height of the other knee. Does the knee stay locked straight with no sag?' },
    quadActivationFullExtension: { title: 'Quad set', how: 'Sit with the leg out straight and press the back of the knee down. Does the thigh tighten and the kneecap pull up?' },
    singleLegSquats60: { title: 'Single-leg squats', how: 'Stand on the surgical leg and squat to about a chair height bend. Count good reps with the knee in line with your toes. The tape will confirm the depth later.' },
    jointPositionErrorDeg: { title: 'Knee sense', how: 'With eyes closed, a helper sets your knee to an angle, then you match it on your own. How many degrees off were you? The tape will measure this later.' },
    instabilityEpisodes7d: { title: 'Giving way', how: 'In the last 7 days, has the knee given way or buckled?' },
    runProgramDonePainFree: { title: 'Run program', how: 'Have you finished your run program with no pain or swelling the next day?' },
    koosSportPct: { title: 'KOOS-Sport', how: 'A short questionnaire about sport and recreation.' },
    ikdcScore: { title: 'IKDC', how: 'A questionnaire about knee symptoms and function.' },
    aclRsiPct: { title: 'ACL-RSI', how: 'A questionnaire about confidence returning to sport.' },
  },
  givenWayYes: 'Yes, it gave way',
  givenWayNo: 'No',
  countLabel: 'Good reps',
  degreesLabel: 'Degrees off',
  questionnaireSoon: 'Coming once the questionnaire licence is checked. Your PT can enter the score for now.',
  checkInNote: 'This one comes from your morning check-in.',
  checkInOpen: 'Open the check-in',
  invalidNumber: 'Enter a whole number.',
} as const

export const fromPtCopy = {
  back: 'Your path',
  eyebrow: 'After a PT visit',
  title: 'From my PT',
  body: 'Numbers only your PT can measure. Each one is saved with today’s date and marked as from your PT.',
  strength: 'Strength, % of your other leg',
  quad: 'Quad',
  hamstring: 'Hamstring',
  glute: 'Glute',
  hq: 'Hamstring : quad ratio, %',
  hop: 'Hop tests, % of other leg',
  gait: 'Walking looks normal',
  signOff: 'Surgeon and PT sign-off for this phase',
  phase: 'Phase your PT has you in',
  phaseAuto: 'Follow the checkpoints',
  limit: 'Bend limit',
  limitHint: 'Your surgeon or PT sets this. The default follows your protocol.',
  limitSet: 'Set a number',
  limitNone: 'No limit',
  limitDefault: 'Protocol default',
  save: 'Save',
  invalid: 'Percentages are 0 to 150, and a bend limit 0 to 160°.',
} as const

export const sampleMenuCopy = {
  label: 'Sample person',
  day: (day: number) => `Day ${day} after surgery · week ${Math.floor(day / WEEK)}`,
  back: (n: number) => `−${n}`,
  forward: (n: number) => `+${n}`,
  reset: 'Reset',
} as const

export const strokeCopy = {
  title: 'Swelling check (optional)',
  how: 'Leg straight and relaxed. Stroke up the inside of the knee three times, then down the outside once. Watch the inside for a wave of fluid.',
  grades: { zero: 'No wave', trace: 'Small wave', '1+': 'Bigger bulge', '2+': 'Comes back on its own', '3+': 'Can’t push it out' },
} as const

export const tapeBendCopy = {
  label: 'Bend',
  now: (deg: number) => `${Math.round(deg)}°`,
  limitFoot: (limit: number) => `Limit ${limit}°`,
  noLimitFoot: 'No limit right now',
  notSet: 'Set up below',
  title: 'Bend in degrees',
  body: 'Calibrate rest with your leg straight. Calibrate max at a bend you know, under your limit, then enter that bend here. Ask your PT to measure it if you can.',
  field: 'Bend at max calibration (°)',
  save: 'Save',
  saved: (deg: number) => `Max calibration reads as ${deg}°.`,
  invalid: 'Enter a bend from 30 to 150°.',
  clear: 'Clear',
} as const
