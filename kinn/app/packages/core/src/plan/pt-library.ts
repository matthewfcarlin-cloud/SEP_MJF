/**
 * The wider knee exercise library a PT picks from on the clinic site: the exercises that
 * published ACL and meniscus protocols name, phase by phase (Mass General Brigham ACL
 * reconstruction 2024 and meniscus repair 2021, the MOON ACL guidelines). RECO's own
 * generated plan does not draw from this list; it keeps the small conservative set in
 * `library.ts`. Doses are conservative starting points a PT edits. Not yet reviewed by a PT.
 */
import type { Metric } from '../protocol/protocols'
import type { Exercise, ExerciseKind, Phase } from './library'

export type ExerciseCategory = 'range' | 'activation' | 'strength' | 'hip-core' | 'balance' | 'cardio' | 'jump' | 'run-agility'

export const CATEGORY_NAMES: Readonly<Record<ExerciseCategory, string>> = {
  range: 'Range of motion',
  activation: 'Quad activation',
  strength: 'Leg strength',
  'hip-core': 'Hip and core',
  balance: 'Balance and control',
  cardio: 'Walking and cardio',
  jump: 'Jumping and landing',
  'run-agility': 'Running and agility',
}

export const CATEGORY_ORDER: readonly ExerciseCategory[] = ['range', 'activation', 'strength', 'hip-core', 'balance', 'cardio', 'jump', 'run-agility']

const KIND_FOR: Readonly<Record<ExerciseCategory, ExerciseKind>> = {
  range: 'mobility',
  activation: 'strength',
  strength: 'strength',
  'hip-core': 'strength',
  balance: 'balance',
  cardio: 'cardio',
  jump: 'balance',
  'run-agility': 'sport',
}

export interface PtExercise {
  readonly exercise: Exercise
  readonly phase: Phase
  readonly category: ExerciseCategory
  readonly worksToward: readonly Metric[]
  /** What published protocols say to check before giving it. The PT decides. */
  readonly caution?: string
}

const X = (
  id: string, name: string, category: ExerciseCategory, phase: Phase, dose: string, lightDose: string, how: string,
  worksToward: readonly Metric[] = [], caution?: string,
): PtExercise => ({
  exercise: { id, name, kind: KIND_FOR[category], dose, lightDose, how },
  phase,
  category,
  worksToward,
  ...(caution !== undefined ? { caution } : {}),
})

const HAMSTRING_CAUTION = 'Protocols delay resisted hamstring work after a hamstring graft or a meniscus repair.'
const OPEN_CHAIN_CAUTION = 'Many ACL protocols limit the range of open-chain knee extension early on.'
const DEEP_BEND_CAUTION = 'Meniscus repair protocols limit loaded bending past 90° early on.'
const WOUND_CAUTION = 'Pool work waits until the incisions have healed.'

/** Categories for the exercises RECO's own plan uses (`LIBRARY.knee`), so the whole catalog filters the same way. */
export const CORE_KNEE_CATEGORY: Readonly<Record<string, ExerciseCategory>> = {
  'quad-set': 'activation',
  'heel-slide': 'range',
  slr: 'activation',
  'walk-short': 'cardio',
  'mini-squat': 'strength',
  'step-up': 'strength',
  bridge: 'hip-core',
  bike: 'cardio',
  'single-leg-balance': 'balance',
  'split-squat': 'strength',
  rdl: 'hip-core',
  'lateral-band': 'hip-core',
  'bike-intervals': 'cardio',
  'hop-prep': 'jump',
  jog: 'run-agility',
  'single-leg-squat': 'strength',
  agility: 'run-agility',
  landing: 'jump',
}

export const PT_KNEE_LIBRARY: readonly PtExercise[] = [
  // Phase 1 · Protect and move
  X('ankle-pump', 'Ankle pumps', 'range', 1, '3 × 20', '2 × 20', 'Leg raised, pump the foot up and down to move swelling out.', ['effusionGrade']),
  X('patellar-glide', 'Kneecap glides', 'range', 1, '2 min', '1 min', 'Leg straight and relaxed, glide the kneecap up, down and side to side.', ['extensionDeficitDeg', 'flexionDeg']),
  X('heel-prop', 'Heel prop', 'range', 1, '5 min, 3 times a day', '3 min', 'Heel on a rolled towel, let the knee hang straight and relax into it.', ['extensionDeficitDeg', 'extensionGapToOtherKneeDeg']),
  X('prone-hang', 'Prone hang', 'range', 1, '5 min, 2 times a day', '3 min', 'Face down, knee just past the edge of the bed, let the shin hang.', ['extensionDeficitDeg', 'extensionGapToOtherKneeDeg']),
  X('wall-heel-slide', 'Wall heel slides', 'range', 1, '3 × 10, 5 s hold', '2 × 10', 'On your back, foot on the wall, let gravity slide the heel down into a bend.', ['flexionDeg', 'flexionGapToOtherKneeDeg']),
  X('seated-knee-bend', 'Seated knee bend, assisted', 'range', 1, '3 × 10, 10 s hold', '2 × 8', 'Sit on a chair, use the other leg to ease the foot back under you.', ['flexionDeg', 'flexionGapToOtherKneeDeg']),
  X('hamstring-stretch', 'Hamstring stretch', 'range', 1, '3 × 30 s', '2 × 20 s', 'On your back, leg up with a strap, knee as straight as is comfortable.', ['extensionDeficitDeg']),
  X('calf-stretch', 'Calf stretch', 'range', 1, '3 × 30 s', '2 × 20 s', 'Hands on a wall, back heel down, knee straight.', ['extensionDeficitDeg', 'normalGait']),
  X('short-arc-quad', 'Short-arc quads', 'activation', 1, '3 × 10, 3 s hold', '2 × 10', 'Roll under the knee, straighten the last part of the range and hold.', ['quadActivationFullExtension', 'slrNoLag'], OPEN_CHAIN_CAUTION),
  X('tke-band', 'Terminal knee extension with a band', 'activation', 1, '3 × 15', '2 × 10', 'Band behind the knee, standing, squeeze the knee straight against it.', ['quadActivationFullExtension', 'extensionDeficitDeg', 'normalGait']),
  X('hamstring-set', 'Hamstring sets', 'activation', 1, '3 × 10, 5 s hold', '2 × 10', 'Knee slightly bent, dig the heel into the bed without moving.', ['hamstringIndexPct'], HAMSTRING_CAUTION),
  X('side-leg-raise', 'Side-lying leg raise', 'hip-core', 1, '3 × 10 each', '2 × 8 each', 'On your side, knee straight, lift the top leg without rolling back.', ['gluteIndexPct']),
  X('prone-leg-raise', 'Prone leg raise', 'hip-core', 1, '3 × 10', '2 × 8', 'Face down, knee straight, lift the leg from the hip.', ['gluteIndexPct']),
  X('calf-raise', 'Calf raises, both legs', 'strength', 1, '3 × 15', '2 × 10', 'Rise onto the toes with equal weight on both feet, lower slowly.', ['normalGait']),
  X('weight-shift', 'Weight shifts', 'balance', 1, '3 × 10 each', '2 × 10 each', 'Standing, shift your weight side to side, then forward and back.', ['normalGait']),
  X('gait-practice', 'Heel-to-toe walking practice', 'cardio', 1, '5 min', '3 min', 'Land on the heel with the knee straight, roll through, even steps.', ['normalGait']),

  // Phase 2 · Build strength
  X('wall-sit', 'Wall sits', 'strength', 2, '3 × 30 s', '2 × 20 s', 'Back on the wall, slide down to a shallow sit, weight even on both legs.', ['quadIndexPct']),
  X('sit-to-stand', 'Sit to stand', 'strength', 2, '3 × 10', '2 × 8', 'From a chair, stand without using your hands, equal weight on both legs.', ['quadIndexPct', 'normalGait']),
  X('leg-press', 'Leg press, both legs', 'strength', 2, '3 × 12', '2 × 10', 'Light weight, slow down and up, knees in line with the toes.', ['quadIndexPct'], DEEP_BEND_CAUTION),
  X('lateral-step-up', 'Lateral step-ups', 'strength', 2, '3 × 10 each', '2 × 8 each', 'Stand side-on to a low step, step up and lower with control.', ['quadIndexPct', 'gluteIndexPct']),
  X('step-down', 'Step-downs', 'strength', 2, '3 × 10 each', '2 × 8 each', 'From a low step, lower the other heel to the floor slowly, knee over toes.', ['quadIndexPct', 'singleLegSquats60']),
  X('knee-extension', 'Knee extension, limited range', 'strength', 2, '3 × 12', '2 × 10', 'Seated machine or band, through the range your PT set.', ['quadIndexPct', 'hqRatioPct'], OPEN_CHAIN_CAUTION),
  X('hamstring-curl', 'Hamstring curls', 'strength', 2, '3 × 12', '2 × 10', 'Standing or machine, curl the heel toward you and lower slowly.', ['hamstringIndexPct', 'hqRatioPct'], HAMSTRING_CAUTION),
  X('single-calf-raise', 'Single-leg calf raises', 'strength', 2, '3 × 12 each', '2 × 8 each', 'Light fingertip support, full height, slow on the way down.', ['normalGait']),
  X('deadlift', 'Romanian deadlift', 'hip-core', 2, '3 × 10', '2 × 8', 'Soft knees, hinge at the hips with a long back, light weight.', ['hamstringIndexPct', 'gluteIndexPct']),
  X('clamshell', 'Clamshells', 'hip-core', 2, '3 × 15 each', '2 × 10 each', 'On your side, knees bent, open the top knee without rolling the hips.', ['gluteIndexPct']),
  X('single-leg-bridge', 'Single-leg bridges', 'hip-core', 2, '3 × 10 each', '2 × 8 each', 'One foot down, lift the hips level, pause, lower slowly.', ['gluteIndexPct', 'hamstringIndexPct']),
  X('plank', 'Plank', 'hip-core', 2, '3 × 30 s', '2 × 20 s', 'Forearms and toes, straight line from head to heels.'),
  X('side-plank', 'Side plank', 'hip-core', 2, '3 × 20 s each', '2 × 15 s each', 'Elbow under the shoulder, hips high, from the knees to start.', ['gluteIndexPct']),
  X('balance-foam', 'Single-leg balance on foam', 'balance', 2, '3 × 30 s each', '2 × 20 s each', 'Soft knee on a foam pad or cushion, eyes forward.', ['jointPositionErrorDeg']),
  X('tandem-walk', 'Heel-to-toe line walk', 'balance', 2, '3 × 10 steps', '2 × 10 steps', 'One foot directly in front of the other along a line.', ['normalGait']),
  X('elliptical', 'Elliptical', 'cardio', 2, '15 min', '10 min', 'Easy resistance, smooth and even on both legs.'),
  X('pool-walk', 'Pool walking', 'cardio', 2, '15 min', '10 min', 'Chest-deep water, normal stride forward, backward and sideways.', ['normalGait'], WOUND_CAUTION),
  X('brisk-walk', 'Brisk walk', 'cardio', 2, '20 min', '10 min', 'Flat ground, quick even steps, no limp.', ['normalGait']),

  // Phase 3 · Build capacity
  X('squat', 'Squats', 'strength', 3, '3 × 10', '2 × 8', 'Sit back to about thighs level, knees over toes, even on both legs.', ['quadIndexPct'], DEEP_BEND_CAUTION),
  X('single-leg-press', 'Single-leg press', 'strength', 3, '3 × 10 each', '2 × 8 each', 'One leg at a time, slow down and up, same weight on both sides if you can.', ['quadIndexPct']),
  X('lunge', 'Forward lunges', 'strength', 3, '3 × 10 each', '2 × 8 each', 'Step forward, lower straight down, push back to standing.', ['quadIndexPct']),
  X('reverse-lunge', 'Reverse lunges', 'strength', 3, '3 × 10 each', '2 × 8 each', 'Step back, lower the back knee toward the floor, front knee over toes.', ['quadIndexPct', 'gluteIndexPct']),
  X('lateral-lunge', 'Side lunges', 'strength', 3, '3 × 8 each', '2 × 6 each', 'Step wide, sit back over the stepping leg, other leg straight.', ['gluteIndexPct']),
  X('rear-foot-split-squat', 'Rear-foot-elevated split squats', 'strength', 3, '3 × 8 each', '2 × 6 each', 'Back foot on a bench, lower straight down, front knee in line with the toes.', ['quadIndexPct', 'singleLegSquats60']),
  X('knee-extension-full', 'Knee extension, full range', 'strength', 3, '3 × 10 each', '2 × 8 each', 'One leg at a time, straighten fully, lower over three seconds.', ['quadIndexPct', 'hqRatioPct']),
  X('nordic-lower', 'Nordic hamstring lowers', 'strength', 3, '3 × 5', '2 × 4', 'Kneeling, ankles held, lower your body forward as slowly as you can.', ['hamstringIndexPct', 'hqRatioPct'], HAMSTRING_CAUTION),
  X('hip-thrust', 'Hip thrusts', 'hip-core', 3, '3 × 10', '2 × 8', 'Shoulders on a bench, drive the hips up, pause at the top.', ['gluteIndexPct']),
  X('copenhagen-plank', 'Copenhagen plank', 'hip-core', 3, '3 × 20 s each', '2 × 15 s each', 'Side plank with the top leg on a bench, from the knee to start.'),
  X('balance-reach', 'Single-leg balance reaches', 'balance', 3, '3 × 6 each', '2 × 5 each', 'Stand on one leg, reach the other foot forward, to the side and behind.', ['jointPositionErrorDeg', 'singleLegSquats60']),
  X('squat-jump', 'Squat jumps', 'jump', 3, '3 × 8', '2 × 5', 'Small jump from a quarter squat, land quietly on both feet, knees over toes.', ['hopLsiPct']),
  X('box-jump', 'Box jumps', 'jump', 3, '3 × 6', '2 × 4', 'Jump up onto a low box with both feet, step back down.', ['hopLsiPct']),
  X('jump-rope', 'Jump rope', 'jump', 3, '3 × 30 s', '2 × 20 s', 'Both feet, small quick bounces, soft knees.', ['hopLsiPct']),
  X('stair-climber', 'Stair climber', 'cardio', 3, '15 min', '10 min', 'Steady pace, full foot on each step, light hands.'),
  X('rowing', 'Rowing machine', 'cardio', 3, '15 min', '10 min', 'Easy pace, push through both legs evenly.'),
  X('swim', 'Swimming, flutter kick', 'cardio', 3, '20 min', '10 min', 'Easy laps, straight-leg kick, no breaststroke kick.', [], WOUND_CAUTION),
  X('skips', 'A-skips', 'run-agility', 3, '4 × 20 steps', '2 × 20 steps', 'Rhythmic skips, knee up, quick foot back down under you.', ['runProgramDonePainFree']),

  // Phase 4 · Back to your activity
  X('walk-jog', 'Walk-jog intervals', 'run-agility', 4, '20 min, jog 1 min then walk 2 min', '10 min', 'Flat ground or treadmill, even steps, stop if you start to limp.', ['runProgramDonePainFree']),
  X('tempo-run', 'Steady run', 'run-agility', 4, '20 min', '10 min', 'A pace you could hold a conversation at.', ['runProgramDonePainFree']),
  X('strides', 'Strides', 'run-agility', 4, '6 × 40 steps', '3 × 40 steps', 'Build up smoothly to fast, hold a few seconds, ease down.', ['runProgramDonePainFree']),
  X('backpedal-shuffle', 'Backpedal and side shuffle', 'run-agility', 4, '4 × 20 steps', '2 × 20 steps', 'Stay low, short quick steps, both directions.'),
  X('decel', 'Run and stop', 'run-agility', 4, '3 × 6', '2 × 4', 'Jog, then stop in three steps with hips back and knees over toes.'),
  X('cutting', 'Planned cuts', 'run-agility', 4, '3 × 6 each', 'Skip today', 'Jog to a cone, plant and cut at a shallow angle; sharper only when it feels controlled.'),
  X('shuttle', 'Shuttle runs', 'run-agility', 4, '6 × 20 steps', 'Skip today', 'Out and back between two cones, touch the line, turn both ways.'),
  X('sport-drills', 'Sport drills, no contact', 'run-agility', 4, '20 min', 'Skip today', 'Your sport movements at part speed, alone or with a ball.'),
  X('single-leg-hop', 'Single-leg hops in place', 'jump', 4, '3 × 8 each', '2 × 5 each', 'Small hops on one leg, land soft and hold your balance.', ['hopLsiPct']),
  X('hop-distance', 'Hop for distance practice', 'jump', 4, '3 × 5 each', '2 × 3 each', 'One hop forward on one leg, stick the landing for two seconds.', ['hopLsiPct']),
  X('lateral-hop', 'Side-to-side hops', 'jump', 4, '3 × 10', '2 × 6', 'Hop over a line from one leg to the other, stick each landing.', ['hopLsiPct']),
  X('drop-jump', 'Drop jumps', 'jump', 4, '3 × 6', '2 × 4', 'Step off a low box, land on both feet and jump straight up.', ['hopLsiPct']),
  X('bounding', 'Bounding', 'jump', 4, '3 × 10 steps', '2 × 6 steps', 'Long running leaps from one leg to the other, soft landings.', ['hopLsiPct']),
  X('single-leg-deadlift-load', 'Single-leg deadlift, loaded', 'hip-core', 4, '3 × 8 each', '2 × 6 each', 'Weight in the opposite hand, hinge at the hip, long back.', ['hamstringIndexPct', 'gluteIndexPct']),
  X('heavy-squat', 'Loaded squats', 'strength', 4, '4 × 6', '2 × 6', 'Bar or dumbbells, the depth and load your PT set.', ['quadIndexPct'], DEEP_BEND_CAUTION),
]
