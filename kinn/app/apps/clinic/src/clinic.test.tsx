import { emptyDataset, findBannedWords, patientSummary } from '@reco/core'
import { renderToStaticMarkup } from 'react-dom/server'

import { buildCaseload, Clinic } from './App'
import { copy } from './copy'
import { relativeDay } from './format'
import { idFromHash } from './use-selection'

const TODAY = '2026-11-12'
const patients = buildCaseload(TODAY)
const page = (selectedId?: string): string =>
  renderToStaticMarkup(<Clinic today={TODAY} patients={patients} selectedId={selectedId} onSelect={() => undefined} />)
const text = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')

describe('patient list', () => {
  test('lists every patient, most urgent first, each with its top flag', () => {
    const html = page()
    const t = text(html)
    const rowNames = [...html.matchAll(/class="row-name">([^<]+)</g)].map((m) => m[1])
    expect(rowNames).toEqual(['Ava', 'Leo', 'Priya', 'Sam', 'Jordan', 'Maya'])
    expect(t).toContain('Reported a red-flag symptom')
    expect(t).toContain('2 flare-ups in 3 days')
    expect(t).toContain('3 bends past the limit')
    expect(t).toContain(copy.nothingNew)
  })

  test('says it is sample data, on the list and in the footer', () => {
    const t = text(page())
    expect(t).toContain(copy.sampleTag)
    expect(t).toContain(copy.sampleNote)
    expect(t).toContain(copy.footer)
  })
})

describe('patient detail', () => {
  test('opens the most urgent patient when none is picked, with the flag first and in their words', () => {
    const html = page()
    const t = text(html)
    expect(t).toContain('Ava ACL reconstruction · week 10 · Netball')
    expect(t).toContain('In their words: "Knee gave way on the stairs".')
    expect(html).toContain('role="alert"')
    expect(t.indexOf('Contact soon')).toBeLessThan(t.indexOf(copy.progressTitle))
  })

  test('shows progress, next steps and the week for the picked patient', () => {
    const t = text(page('leo-flare'))
    expect(t).toContain('Leo ACL reconstruction · week 7 · Football')
    expect(t).toContain('3 · Build strength')
    expect(t).toContain(copy.heldBack)
    expect(t).toContain('No pain or swelling after workouts')
    expect(t).toContain('A reaction in the last 7 days')
    expect(t).toContain('4 flare-up mornings')
    expect(t).toContain('Phase 4 (Bridge to sport) opens once these are met')
  })

  test('lists the in-clinic checkpoints apart, for the next visit', () => {
    const t = text(page('ava-gave-way'))
    const forClinic = t.slice(t.indexOf(copy.forClinic))
    expect(forClinic).toContain('Quad strength ≥80% of other leg')
    expect(forClinic).toContain(copy.by.pt)
  })

  test('shows the bend limit while one is in force', () => {
    expect(text(page('priya-meniscus'))).toContain(copy.bendLimit(90))
  })

  test('an unknown link falls back to the most urgent patient', () => {
    expect(text(page('nobody'))).toContain('In their words')
  })

  test('a patient without a checkpoint protocol still shows', () => {
    const base = emptyDataset(TODAY)
    const other = patientSummary('x', { ...base, profile: { ...base.profile, name: 'Kai', injury: 'tennis-elbow', injuryDate: '2026-10-01' } }, TODAY)
    const html = renderToStaticMarkup(<Clinic today={TODAY} patients={[other]} selectedId="x" onSelect={() => undefined} />)
    expect(text(html)).toContain(copy.noProtocol)
    expect(text(html)).toContain(copy.noRange)
  })
})

describe('copy', () => {
  function* strings(node: unknown): Generator<string> {
    if (typeof node === 'string') yield node
    else if (typeof node === 'function') {
      for (const args of [[3], [3, 6], ['Nov 5', 'Nov 11'], ['today', 4, 'some']]) {
        try {
          const out = (node as (...a: unknown[]) => unknown)(...args)
          if (typeof out === 'string') yield out
        } catch {
          // a string function given a number, or the other way round; another attempt fits
        }
      }
    } else if (node && typeof node === 'object') for (const v of Object.values(node)) yield* strings(v)
  }

  test('no banned words except "patient", which is the right word for a PT', () => {
    const all = [...strings(copy), ...[...new Set(patients.flatMap((p) => p.flags.flatMap((f) => [f.title, f.detail])))]]
    expect(all.length).toBeGreaterThan(40)
    expect(all.filter((s) => findBannedWords(s).some((w) => w !== 'patient'))).toEqual([])
  })

  test('a malformed link opens nobody instead of crashing', () => {
    expect(idFromHash('#/p/leo-flare')).toBe('leo-flare')
    expect(idFromHash('#/p/%E0')).toBeUndefined()
    expect(idFromHash('#other')).toBeUndefined()
  })

  test('relative days read naturally', () => {
    expect([TODAY, '2026-11-11', '2026-11-09', '2026-11-01'].map((d) => relativeDay(d, TODAY))).toEqual(['today', 'yesterday', '3 days ago', 'Nov 1'])
  })
})
