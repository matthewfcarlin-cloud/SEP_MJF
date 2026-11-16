/**
 * The exercise library as a PT browses it on the clinic site: every exercise for the joint, the
 * plan phase it belongs to, and which protocol checkpoints it works toward. Picking one makes a
 * plan entry the PT can edit; the library itself never changes.
 */
import type { Joint } from '../manual/types'
import type { Metric } from '../protocol/protocols'
import { LIBRARY, PHASE_NAMES } from './library'
import type { Exercise, Phase } from './library'
import { CORE_KNEE_CATEGORY, PT_KNEE_LIBRARY } from './pt-library'
import type { ExerciseCategory } from './pt-library'
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
  /** How a PT would file it. Missing for joints whose library has no categories yet. */
  readonly category?: ExerciseCategory
  /** What published protocols say to check before giving it. */
  readonly caution?: string
}

const PHASES: readonly Phase[] = [1, 2, 3, 4]

/** The exercises RECO's own plan uses, each once (the first phase it appears in). */
function coreCatalog(joint: Joint): readonly CatalogExercise[] {
  const seen = new Set<string>()
  return PHASES.flatMap((phase) =>
    LIBRARY[joint][phase]
      .filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)))
      .map((exercise) => {
        const category = joint === 'knee' ? CORE_KNEE_CATEGORY[exercise.id] : undefined
        return { exercise, phase, phaseName: PHASE_NAMES[phase], worksToward: WORKS_TOWARD[exercise.id] ?? [], ...(category !== undefined ? { category } : {}) }
      }),
  )
}

/**
 * Every exercise a PT can pick for a joint, in phase order: RECO's own set first within each
 * phase, then the wider PT library (knee only so far).
 */
export function catalogFor(joint: Joint): readonly CatalogExercise[] {
  const core = coreCatalog(joint)
  if (joint !== 'knee') return core
  const wider: readonly CatalogExercise[] = PT_KNEE_LIBRARY.map((x) => ({
    exercise: x.exercise,
    phase: x.phase,
    phaseName: PHASE_NAMES[x.phase],
    worksToward: x.worksToward,
    category: x.category,
    ...(x.caution !== undefined ? { caution: x.caution } : {}),
  }))
  return PHASES.flatMap((phase) => [...core, ...wider].filter((c) => c.phase === phase))
}

/** The catalog narrowed the way the library picker narrows it. An empty query matches everything. */
export function searchCatalog(
  catalog: readonly CatalogExercise[],
  filter: { readonly query?: string; readonly phase?: Phase; readonly category?: ExerciseCategory },
): readonly CatalogExercise[] {
  const words = (filter.query ?? '').toLowerCase().split(/\s+/).filter((w) => w !== '')
  return catalog.filter((c) => {
    if (filter.phase !== undefined && c.phase !== filter.phase) return false
    if (filter.category !== undefined && c.category !== filter.category) return false
    const haystack = `${c.exercise.name} ${c.exercise.how}`.toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
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
