import { catalogFor, doseText, validatePlan } from '@reco/core'
import type { RecoveryPlan } from '@reco/core'
import { renderToStaticMarkup } from 'react-dom/server'

import { buildCaseload, Clinic } from './App'
import { copy } from './copy'
import { addCustom, addFromLibrary, moveEntry, removeEntry, setAdaptation, setAuthor, setDoseField, setDoseNote, setPerSide, startDraft, updateEntry } from './plan-draft'
import { selectionFromHash } from './use-selection'

const TODAY = '2026-11-12'
const text = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')
const squat = catalogFor('knee').find((c) => c.exercise.id === 'mini-squat')!.exercise

describe('drafting a plan', () => {
  test('a fresh draft is version 1 with no author; an existing PT plan drafts its next version', () => {
    const fresh = startDraft(undefined, 'sam', TODAY)
    expect(fresh).toMatchObject({ version: 1, author: { kind: 'pt', name: '' }, adaptation: 'as-written', entries: [] })
    const leo = buildCaseload(TODAY).find((p) => p.id === 'leo-flare')!.writtenPlan.plan!
    expect(startDraft(leo, 'leo-flare', TODAY)).toMatchObject({ version: leo.version + 1, adaptation: 'lighter-on-flare', publishedOn: TODAY })
  })

  test('every edit returns a new plan and leaves the old one as it was', () => {
    const a = startDraft(undefined, 'sam', TODAY)
    const b = addFromLibrary(a, squat, 'n1')
    expect(a.entries).toHaveLength(0)
    expect(b.entries[0]).toMatchObject({ id: 'n1', name: 'Mini squats', source: { kind: 'library', exerciseId: 'mini-squat' } })
    const c = updateEntry(b, 'n1', { name: 'Mini squats to a chair', daysPerWeek: 4 })
    expect(b.entries[0]?.name).toBe('Mini squats')
    expect(c.entries[0]).toMatchObject({ name: 'Mini squats to a chair', daysPerWeek: 4 })
  })

  test('typed exercises, ordering and removal', () => {
    let d = addCustom(addFromLibrary(startDraft(undefined, 'sam', TODAY), squat, 'n1'), 'n2')
    d = updateEntry(d, 'n2', { name: 'Wall sit' })
    expect(moveEntry(d, 'n2', -1).entries.map((e) => e.id)).toEqual(['n2', 'n1'])
    expect(moveEntry(d, 'n1', -1)).toBe(d)
    expect(removeEntry(d, 'n1').entries.map((e) => e.name)).toEqual(['Wall sit'])
  })

  test('dose fields: empty clears, numbers are kept as typed so validation can name a bad one', () => {
    const dose = { sets: 3, reps: 12 }
    expect(setDoseField(dose, 'reps', '')).toEqual({ sets: 3 })
    expect(setDoseField(dose, 'seconds', '5')).toEqual({ sets: 3, reps: 12, seconds: 5 })
    expect(Number.isNaN(setDoseField(dose, 'sets', 'x').sets)).toBe(true)
    expect(setPerSide(setDoseNote(dose, 'slow down'), true)).toEqual({ sets: 3, reps: 12, note: 'slow down', perSide: true })
    expect(doseText(setDoseNote(dose, '  '))).toBe('3 × 12')
  })

  test('a finished draft passes the same check the backend will run', () => {
    let d = setAuthor(startDraft(undefined, 'sam', TODAY), 'Dana Ruiz, PT')
    expect(validatePlan(d)).toEqual([])
    d = addCustom(d, 'n2')
    expect(validatePlan(d)).toEqual(['Exercise 1 needs a name'])
    d = setAdaptation(updateEntry(d, 'n2', { name: 'Wall sit' }), 'lighter-on-flare')
    expect(validatePlan(d)).toEqual([])
    expect(d.adaptation).toBe('lighter-on-flare')
  })
})

describe('the plan on the clinic site', () => {
  const page = (selectedId: string, view: 'exercises' | 'plan', plans: Readonly<Record<string, RecoveryPlan>> = {}) =>
    renderToStaticMarkup(<Clinic today={TODAY} patients={buildCaseload(TODAY, plans)} selectedId={selectedId} view={view} />)

  test('the exercise plan tab shows the PT plan with its author, version and flare-up setting', () => {
    const t = text(page('leo-flare', 'exercises'))
    expect(t).toContain(copy.planTitle)
    expect(t).toContain('By Dana Ruiz, PT (sample) · version 2')
    expect(t).toContain(copy.planLighter)
    expect(t).toContain('Mini squats 3 × 12')
    expect(t).toContain(copy.planEdit)
  })

  test('a patient with only a typed plan, or none, is offered a plan to write', () => {
    const sam = text(page('sam-stuck-bend', 'exercises'))
    expect(sam).toContain(copy.planTyped)
    expect(sam).toContain(copy.planWrite)
  })

  test('a plan published here replaces the sample plan', () => {
    const published: RecoveryPlan = { id: 'p', version: 3, author: { kind: 'pt', name: 'Alex Kim, PT' }, adaptation: 'as-written', publishedOn: TODAY, entries: [{ id: 'n1', source: { kind: 'custom' }, name: 'Wall sit', dose: { sets: 3, seconds: 30 }, daysPerWeek: 5 }] }
    const t = text(page('leo-flare', 'exercises', { 'leo-flare': published }))
    expect(t).toContain('By Alex Kim, PT · version 3')
    expect(t).toContain('Wall sit 3 × 30 s')
    expect(t).not.toContain('Mini squats 3 × 12')
  })

  test('the editor opens on the next version, with the library and the flare-up choice', () => {
    const html = page('leo-flare', 'plan')
    const t = text(html)
    expect(t).toContain(copy.editorTitle('Leo'))
    expect(t).toContain(copy.editorVersion(3, 2))
    expect(t).toContain(copy.libraryTitle)
    expect(t).toContain(`${copy.worksToward}: Quad strength ≥80% of other leg`)
    expect(t).toContain(copy.adaptationLighter)
    expect(t).toContain(copy.publish(3))
    expect(t).toContain(copy.backendNote)
    expect(html.match(/class="entry"/g)).toHaveLength(5)
  })

  test('after publishing, the exercise plan tab says which version went out, and only that tab', () => {
    const patients = buildCaseload(TODAY)
    const onPlan = text(renderToStaticMarkup(<Clinic today={TODAY} patients={patients} selectedId="leo-flare" view="exercises" publishedVersion={3} />))
    expect(onPlan).toContain(copy.published(3))
    const onSummary = text(renderToStaticMarkup(<Clinic today={TODAY} patients={patients} selectedId="leo-flare" view="detail" publishedVersion={3} />))
    expect(onSummary).not.toContain(copy.published(3))
    const quiet = text(renderToStaticMarkup(<Clinic today={TODAY} patients={patients} selectedId="leo-flare" view="exercises" />))
    expect(quiet).not.toContain('published.')
  })

  test('plan links route to the editor', () => {
    expect(selectionFromHash('#/p/leo-flare/plan')).toEqual({ id: 'leo-flare', view: 'plan' })
    expect(selectionFromHash('#/p/leo-flare/exercises')).toEqual({ id: 'leo-flare', view: 'exercises' })
    expect(selectionFromHash('#/p/leo-flare')).toEqual({ id: 'leo-flare', view: 'detail' })
    expect(selectionFromHash('#/p/')).toBeUndefined()
  })
})
