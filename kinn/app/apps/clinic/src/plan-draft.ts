/**
 * Editing a PT plan, as pure functions over an immutable draft: every change returns a new plan,
 * so React redraws and nothing is edited in place. Publishing is the next version of the plan.
 */
import { entryFromLibrary } from '@reco/core'
import type { Dose, Exercise, PlanAdaptation, PlanEntry, RecoveryPlan } from '@reco/core'

const DEFAULT_DAYS = 3

/** The draft a PT edits: the next version of the current PT plan, or a fresh one. */
export function startDraft(current: RecoveryPlan | undefined, patientId: string, today: string): RecoveryPlan {
  if (current && current.author.kind === 'pt') return { ...current, version: current.version + 1, publishedOn: today }
  return { id: `plan-${patientId}`, version: 1, author: { kind: 'pt', name: '' }, adaptation: 'as-written', entries: [], publishedOn: today }
}

const withEntries = (plan: RecoveryPlan, entries: readonly PlanEntry[]): RecoveryPlan => ({ ...plan, entries })

export const addFromLibrary = (plan: RecoveryPlan, exercise: Exercise, id: string): RecoveryPlan =>
  withEntries(plan, [...plan.entries, entryFromLibrary(exercise, id)])

export const addCustom = (plan: RecoveryPlan, id: string): RecoveryPlan =>
  withEntries(plan, [...plan.entries, { id, source: { kind: 'custom' }, name: '', dose: { sets: 3, reps: 10 }, daysPerWeek: DEFAULT_DAYS }])

export const updateEntry = (plan: RecoveryPlan, id: string, patch: Partial<Omit<PlanEntry, 'id' | 'source'>>): RecoveryPlan =>
  withEntries(plan, plan.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))

/**
 * A change to an entry's main dose. "Each side" describes the exercise, not the day, so the
 * flare-up dose follows it.
 */
export function withDose(entry: PlanEntry, dose: Dose): Partial<Omit<PlanEntry, 'id' | 'source'>> {
  if (!entry.lightDose) return { dose }
  return { dose, lightDose: setPerSide(entry.lightDose, dose.perSide === true) }
}

/** The flare-up dose the editor shows: the PT's own, or the full dose until they set one. */
export const lightDoseOf = (entry: PlanEntry): Dose => entry.lightDose ?? entry.dose

export const removeEntry = (plan: RecoveryPlan, id: string): RecoveryPlan => withEntries(plan, plan.entries.filter((e) => e.id !== id))

export function moveEntry(plan: RecoveryPlan, id: string, by: -1 | 1): RecoveryPlan {
  const at = plan.entries.findIndex((e) => e.id === id)
  const to = at + by
  if (at < 0 || to < 0 || to >= plan.entries.length) return plan
  const next = [...plan.entries]
  const [moved] = next.splice(at, 1)
  next.splice(to, 0, moved!)
  return withEntries(plan, next)
}

export const setAdaptation = (plan: RecoveryPlan, adaptation: PlanAdaptation): RecoveryPlan => ({ ...plan, adaptation })

export const setAuthor = (plan: RecoveryPlan, name: string): RecoveryPlan => ({ ...plan, author: { kind: 'pt', name } })

export type DoseField = 'sets' | 'reps' | 'seconds' | 'minutes'

/** One dose field from a text input: empty clears it; anything else is kept as typed, so validation can name it. */
export function setDoseField(dose: Dose, field: DoseField, text: string): Dose {
  const { [field]: _old, ...rest } = dose
  const trimmed = text.trim()
  if (trimmed === '') return rest
  return { ...rest, [field]: Number(trimmed) }
}

export function setDoseNote(dose: Dose, note: string): Dose {
  const { note: _old, ...rest } = dose
  return note.trim() === '' ? rest : { ...rest, note }
}

export function setPerSide(dose: Dose, perSide: boolean): Dose {
  const { perSide: _old, ...rest } = dose
  return perSide ? { ...rest, perSide: true } : rest
}
