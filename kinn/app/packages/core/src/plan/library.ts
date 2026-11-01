/**
 * Exercise library and phase tables, from common published rehab protocols
 * (general ACL, meniscus, rotator cuff, shoulder instability, UCL and lateral
 * elbow programmes). These are starting points the athlete's PT can change,
 * not a prescription. Every dose is deliberately conservative.
 */
import type { Injury, Joint } from '../manual/types'

export type ExerciseKind = 'mobility' | 'strength' | 'cardio' | 'balance' | 'sport'

export interface Exercise {
  readonly id: string
  readonly name: string
  readonly kind: ExerciseKind
  /** Full dose, e.g. "3 × 12". */
  readonly dose: string
  /** Lighter dose used on a Steady day. */
  readonly lightDose: string
  readonly how: string
}

/** Phase 1 protect and move, 2 build strength, 3 build capacity, 4 return to your activity. */
export type Phase = 1 | 2 | 3 | 4

export const PHASE_NAMES: Readonly<Record<Phase, string>> = {
  1: 'Protect and move',
  2: 'Build strength',
  3: 'Build capacity',
  4: 'Back to your activity',
}

const E = (id: string, name: string, kind: ExerciseKind, dose: string, lightDose: string, how: string): Exercise => ({ id, name, kind, dose, lightDose, how })

export const LIBRARY: Readonly<Record<Joint, Readonly<Record<Phase, readonly Exercise[]>>>> = {
  knee: {
    1: [
      E('quad-set', 'Quad sets', 'strength', '3 × 10, 5 s hold', '2 × 10', 'Leg straight, press the back of the knee down, hold.'),
      E('heel-slide', 'Heel slides', 'mobility', '3 × 15', '2 × 10', 'Slide the heel toward you to a comfortable bend, then straighten fully.'),
      E('slr', 'Straight-leg raise', 'strength', '3 × 10', '2 × 8', 'Lock the knee straight first, then lift to the height of the other knee.'),
      E('walk-short', 'Easy walk', 'cardio', '10 min', '5 min', 'Flat ground, normal stride, no limp.'),
    ],
    2: [
      E('mini-squat', 'Mini squats', 'strength', '3 × 12', '2 × 10', 'Feet hip width, sit back to about a quarter squat, knees over toes.'),
      E('step-up', 'Step-ups', 'strength', '3 × 10 each', '2 × 8 each', 'Low step, drive through the heel, control the way down.'),
      E('bridge', 'Bridges', 'strength', '3 × 12', '2 × 10', 'Squeeze glutes, lift hips, pause one second.'),
      E('bike', 'Stationary bike', 'cardio', '15 min', '10 min', 'Easy resistance, smooth full circles.'),
      E('single-leg-balance', 'Single-leg balance', 'balance', '3 × 30 s', '2 × 20 s', 'Soft knee, eyes forward.'),
    ],
    3: [
      E('split-squat', 'Split squats', 'strength', '3 × 10 each', '2 × 8 each', 'Long stance, back knee toward the floor, front knee tracks the toes.'),
      E('rdl', 'Single-leg RDL', 'strength', '3 × 8 each', '2 × 6 each', 'Hinge at the hip, long spine, slow.'),
      E('lateral-band', 'Lateral band walks', 'strength', '3 × 12 steps', '2 × 10 steps', 'Band above the knees, stay low, small steps.'),
      E('bike-intervals', 'Bike intervals', 'cardio', '20 min, 6 × 30 s harder', '15 min steady', 'Harder means breathing hard but in control.'),
      E('hop-prep', 'Pogo hops', 'balance', '3 × 20', '2 × 10', 'Small, quick, quiet landings on both feet.'),
    ],
    4: [
      E('jog', 'Jog', 'cardio', '20 min easy', '10 min easy', 'Flat ground, conversational pace.'),
      E('single-leg-squat', 'Single-leg squat to box', 'strength', '3 × 8 each', '2 × 6 each', 'Sit to a box, knee stays in line with the toes.'),
      E('agility', 'Ladder and cone drills', 'sport', '15 min', 'Skip today', 'Start straight-line, add cuts only when they feel controlled.'),
      E('landing', 'Landing practice', 'balance', '3 × 8', '2 × 5', 'Jump down from a low box, land soft and hold two seconds.'),
    ],
  },
  shoulder: {
    1: [
      E('pendulum', 'Pendulums', 'mobility', '3 × 30 s', '2 × 20 s', 'Lean on a table, let the arm hang and swing in small circles.'),
      E('table-slide', 'Table slides', 'mobility', '3 × 10', '2 × 8', 'Hand on a towel, slide forward as far as is comfortable.'),
      E('scap-squeeze', 'Shoulder blade squeezes', 'strength', '3 × 10, 5 s hold', '2 × 10', 'Squeeze the blades back and down, keep the neck relaxed.'),
      E('walk-short', 'Easy walk', 'cardio', '15 min', '10 min', 'Arm relaxed, normal swing if it is comfortable.'),
    ],
    2: [
      E('wall-slide', 'Wall slides', 'mobility', '3 × 10', '2 × 8', 'Forearms on the wall, slide up only as far as is comfortable.'),
      E('band-er', 'Band external rotation', 'strength', '3 × 12', '2 × 10', 'Elbow at your side, rotate out slowly against the band.'),
      E('band-row', 'Band rows', 'strength', '3 × 12', '2 × 10', 'Pull the elbows back, squeeze the blades.'),
      E('isometric-press', 'Wall press holds', 'strength', '3 × 20 s', '2 × 15 s', 'Gentle press into the wall at shoulder height.'),
    ],
    3: [
      E('db-press', 'Light dumbbell press', 'strength', '3 × 10', '2 × 8', 'Seated, press up without shrugging.'),
      E('prone-y', 'Prone Y raises', 'strength', '3 × 10', '2 × 8', 'Lying face down, thumbs up, lift into a Y.'),
      E('band-er-90', 'Band rotation at 90°', 'strength', '3 × 10', '2 × 8', 'Elbow at shoulder height, rotate up slowly.'),
      E('bike', 'Bike or brisk walk', 'cardio', '20 min', '15 min', 'Keep the shoulder relaxed.'),
    ],
    4: [
      E('plyo-ball', 'Ball throws against a wall', 'sport', '3 × 15', 'Skip today', 'Two hands first, then one, short distance.'),
      E('pushup-plus', 'Push-up plus', 'strength', '3 × 8', '2 × 6', 'From the knees if needed, push the floor away at the top.'),
      E('sport-motion', 'Sport motion, half speed', 'sport', '10 min', 'Skip today', 'Your sport movement at half speed, stop if it pinches.'),
    ],
  },
  elbow: {
    1: [
      E('wrist-stretch', 'Wrist flexor and extensor stretch', 'mobility', '3 × 30 s each', '2 × 20 s each', 'Arm straight, gently bend the wrist with the other hand.'),
      E('elbow-bend', 'Elbow bend and straighten', 'mobility', '3 × 15', '2 × 10', 'Slow, full comfortable range.'),
      E('grip', 'Grip squeezes', 'strength', '3 × 15', '2 × 10', 'Soft ball or towel, squeeze for two seconds.'),
      E('walk-short', 'Easy walk', 'cardio', '20 min', '10 min', 'Keeps everything else moving.'),
    ],
    2: [
      E('ecc-wrist', 'Slow wrist extension lowers', 'strength', '3 × 15', '2 × 10', 'Light weight, lift with the other hand, lower slowly over 3 s.'),
      E('supination', 'Forearm rotations', 'strength', '3 × 12 each way', '2 × 10', 'Hold a light hammer near the head, rotate slowly.'),
      E('band-row', 'Band rows', 'strength', '3 × 12', '2 × 10', 'Pull the elbows back, squeeze the blades.'),
      E('band-er', 'Band external rotation', 'strength', '3 × 12', '2 × 10', 'Elbow at your side, rotate out against the band.'),
    ],
    3: [
      E('ecc-wrist-heavy', 'Wrist extension lowers, heavier', 'strength', '3 × 15', '2 × 12', 'Add a little weight only if the last week felt easy.'),
      E('farmer-carry', 'Farmer carries', 'strength', '4 × 30 m', '2 × 20 m', 'Tall posture, steady grip.'),
      E('triceps', 'Triceps extensions', 'strength', '3 × 12', '2 × 10', 'Light band or dumbbell, elbow still.'),
    ],
    4: [
      E('throwing', 'Interval throwing, short distance', 'sport', 'As your PT sets', 'Skip today', 'Follow the distance and count your PT gives you.'),
      E('sport-motion', 'Sport motion, half speed', 'sport', '10 min', 'Skip today', 'Stop at the first sharp pain.'),
      E('farmer-carry', 'Farmer carries', 'strength', '4 × 30 m', '3 × 20 m', 'Tall posture, steady grip.'),
    ],
  },
}

/** Recovery-day options, used on Ease off days for every joint. */
export const RECOVERY_DAY: Readonly<Record<Joint, readonly Exercise[]>> = {
  knee: [LIBRARY.knee[1][1]!, E('walk-easy', 'Easy walk or bike', 'cardio', '15 min easy', '15 min easy', 'Keep it comfortable the whole way.')],
  shoulder: [LIBRARY.shoulder[1][0]!, LIBRARY.shoulder[1][2]!],
  elbow: [LIBRARY.elbow[1][0]!, LIBRARY.elbow[1][1]!],
}

/** Week thresholds where each phase starts, measured from surgery or injury. */
export const PHASE_WEEKS: Readonly<Record<Injury, readonly [number, number, number]>> = {
  acl: [6, 12, 24],
  meniscus: [4, 10, 16],
  'rotator-cuff': [8, 14, 24],
  'shoulder-dislocation': [3, 8, 14],
  ucl: [6, 12, 20],
  'tennis-elbow': [2, 6, 12],
  other: [3, 8, 14],
}

/** Typical time back to the athlete's activity, weeks from surgery or injury: [low, high]. Published ranges, not a date for anyone. */
export const TYPICAL_RETURN_WEEKS: Readonly<Record<Injury, { readonly surgery: readonly [number, number]; readonly noSurgery: readonly [number, number] }>> = {
  acl: { surgery: [36, 52], noSurgery: [12, 26] },
  meniscus: { surgery: [16, 24], noSurgery: [6, 12] },
  'rotator-cuff': { surgery: [24, 40], noSurgery: [12, 24] },
  'shoulder-dislocation': { surgery: [24, 36], noSurgery: [12, 20] },
  ucl: { surgery: [52, 78], noSurgery: [12, 16] },
  'tennis-elbow': { surgery: [12, 24], noSurgery: [8, 24] },
  other: { surgery: [12, 24], noSurgery: [6, 16] },
}

/** Which kinds go on which weekday (0 = Sunday). Two strength days, two conditioning days, one sport day in phase 4, a rest day. */
export const WEEK_TEMPLATE: readonly (readonly ExerciseKind[])[] = [
  [],
  ['strength', 'mobility'],
  ['cardio', 'balance'],
  ['strength', 'mobility'],
  ['cardio', 'balance'],
  ['strength', 'sport'],
  ['cardio', 'sport'],
]
