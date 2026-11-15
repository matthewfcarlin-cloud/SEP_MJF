/**
 * The exercise library as a PT browses it on the clinic site: every exercise for the joint, the
 * plan phase it belongs to, and which protocol checkpoints it works toward. Picking one makes a
 * plan entry the PT can edit; the library itself never changes.
 */
import type { Joint } from '../manual/types'
import type { Metric } from '../protocol/protocols'
import { LIBRARY, PHASE_NAMES } from './library'
import type { Exercise, Phase } from './library'
import { parseDose } from './recovery'
import type { PlanEntry } from './recovery'

/** Which checkpoint metrics an exercise trains (knee). Exercises not listed train general capacity. */
export const WORKS_TOWARD: Readonly<Record<string, readonly Metric[]>> = {
  'quad-set': ['quadActivationFullExtension', 'extensionDeficitDeg'],
  slr: ['slrNoLag'],
  'heel-slide': ['flexionDeg', 'flexionGapToOtherKneeDeg'],
  bike: ['flexionGapToOtherKneeDeg'],
  'mini-squat': ['quadIndexPct'],
  'step-up': ['quadIndexPct', 'normalGait'],
  bridge: ['gluteIndexPct', 'hamstringIndexPct'],
  'single-leg-balance': ['jointPositionErrorDeg'],
  'split-squat': ['quadIndexPct', 'singleLegSquats60'],
  rdl: ['hamstringIndexPct', 'gluteIndexPct'],
  'lateral-band': ['gluteIndexPct'],
  'hop-prep': ['hopLsiPct'],
  'single-leg-squat': ['singleLegSquats60', 'quadIndexPct'],
  landing: ['hopLsiPct'],
  jog: ['runProgramDonePainFree'],
}

export interface CatalogExercise {
  readonly exercise: Exercise
  readonly phase: Phase
  readonly phaseName: string
  readonly worksToward: readonly Metric[]
}

/** Every exercise for a joint, in phase order, each once (the first phase it appears in). */
export function catalogFor(joint: Joint): readonly CatalogExercise[] {
  const seen = new Set<string>()
  const phases: readonly Phase[] = [1, 2, 3, 4]
  return phases.flatMap((phase) =>
    LIBRARY[joint][phase]
      .filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)))
      .map((exercise) => ({ exercise, phase, phaseName: PHASE_NAMES[phase], worksToward: WORKS_TOWARD[exercise.id] ?? [] })),
  )
}

const DEFAULT_DAYS = 3

/** A plan entry from a library exercise, with the library's doses as the starting point. */
export function entryFromLibrary(exercise: Exercise, id: string, daysPerWeek = DEFAULT_DAYS): PlanEntry {
  return {
    id,
    source: { kind: 'library', exerciseId: exercise.id },
    name: exercise.name,
    how: exercise.how,
    dose: parseDose(exercise.dose),
    lightDose: parseDose(exercise.lightDose),
    daysPerWeek,
  }
}
