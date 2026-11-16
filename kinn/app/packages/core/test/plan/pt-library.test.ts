import { catalogFor, entryFromLibrary, searchCatalog } from '../../src/plan/catalog'
import { CATEGORY_NAMES, CATEGORY_ORDER, CORE_KNEE_CATEGORY, PT_KNEE_LIBRARY } from '../../src/plan/pt-library'
import { LIBRARY } from '../../src/plan/library'
import { doseText, validatePlan } from '../../src/plan/recovery'
import { PROTOCOLS } from '../../src/protocol/protocols'
import { findBannedWords } from '../../src/copy/banned'

const knee = catalogFor('knee')

describe('the PT exercise library', () => {
  test('the knee catalog is wide enough to write a real plan from, with every category in every phase it belongs to', () => {
    expect(knee.length).toBeGreaterThanOrEqual(80)
    for (const phase of [1, 2, 3, 4] as const) expect(knee.filter((c) => c.phase === phase).length).toBeGreaterThanOrEqual(15)
    for (const category of CATEGORY_ORDER) {
      expect(CATEGORY_NAMES[category]).toBeTruthy()
      expect(knee.some((c) => c.category === category)).toBe(true)
    }
  })

  test('ids are unique across the whole catalog, so a plan entry points at one exercise', () => {
    const ids = knee.map((c) => c.exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('every knee exercise has a category, including the ones RECO’s own plan uses', () => {
    expect(knee.every((c) => c.category !== undefined)).toBe(true)
    const coreIds = new Set(Object.values(LIBRARY.knee).flatMap((p) => p.map((e) => e.id)))
    for (const id of coreIds) expect(CORE_KNEE_CATEGORY[id]).toBeDefined()
  })

  test('every dose reads into numbers a PT can edit and passes the publish check', () => {
    const entries = knee.map((c, i) => entryFromLibrary(c.exercise, `e${i}`))
    for (const e of entries) {
      expect(doseText(e.dose)).not.toBe('')
      const structured = e.dose.sets !== undefined || e.dose.minutes !== undefined
      expect(structured, `${e.name}: ${doseText(e.dose)}`).toBe(true)
    }
    expect(validatePlan({ id: 'p', version: 1, author: { kind: 'pt', name: 'Dana Ruiz, PT' }, adaptation: 'as-written', entries, publishedOn: '2026-11-15' })).toEqual([])
  })

  test('works-toward metrics are ones a knee protocol actually checks', () => {
    const checked = new Set(Object.values(PROTOCOLS).flatMap((p) => p.phases.flatMap((ph) => ph.exitCriteria.map((c) => c.metric))))
    for (const x of PT_KNEE_LIBRARY) for (const m of x.worksToward) expect(checked.has(m), `${x.exercise.id}: ${m}`).toBe(true)
  })

  test('RECO’s own plan still draws only from its small set', () => {
    const coreIds = new Set(Object.values(LIBRARY.knee).flatMap((p) => p.map((e) => e.id)))
    expect(PT_KNEE_LIBRARY.some((x) => coreIds.has(x.exercise.id))).toBe(false)
    expect(coreIds.size).toBe(18)
  })

  test('no library string uses a word RECO never says', () => {
    for (const c of knee) expect(findBannedWords(`${c.exercise.name} ${c.exercise.how} ${c.exercise.dose} ${c.exercise.lightDose}`), c.exercise.id).toEqual([])
  })

  test('other joints keep their short library until theirs is written', () => {
    expect(catalogFor('shoulder').length).toBeLessThan(20)
    expect(catalogFor('shoulder').every((c) => c.category === undefined)).toBe(true)
  })
})

describe('searching the catalog', () => {
  test('narrows by words, phase and category together', () => {
    expect(searchCatalog(knee, {}).length).toBe(knee.length)
    expect(searchCatalog(knee, { query: 'heel' }).map((c) => c.exercise.id)).toEqual(expect.arrayContaining(['heel-slide', 'heel-prop', 'wall-heel-slide']))
    expect(searchCatalog(knee, { query: 'HEEL prop' }).map((c) => c.exercise.id)).toEqual(['heel-prop'])
    expect(searchCatalog(knee, { phase: 4, category: 'jump' }).every((c) => c.phase === 4 && c.category === 'jump')).toBe(true)
    expect(searchCatalog(knee, { query: 'zzz' })).toEqual([])
  })
})
