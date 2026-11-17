import { emptyDataset, findBannedWords, patientSummary } from '@reco/core'
import { renderToStaticMarkup } from 'react-dom/server'

import { buildCaseload, Clinic } from './App'
import { copy } from './copy'
import { relativeDay } from './format'
import { recoveryFraction } from './recovery'
import { chartHref, idFromHash, selectionFromHash } from './use-selection'
import type { ChartView } from './use-selection'

const TODAY = '2026-11-12'
const patients = buildCaseload(TODAY)
const page = (selectedId?: string, view: ChartView = 'detail'): string =>
  renderToStaticMarkup(<Clinic today={TODAY} patients={patients} selectedId={selectedId} view={view} />)
const text = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')

describe('the patients table', () => {
  test('lists every patient, most urgent first, each with its top flag as a word', () => {
    const html = page()
    const t = text(html)
    const rowNames = [...html.matchAll(/class="row-name"[^>]*>([^<]+)</g)].map((m) => m[1])
    expect(rowNames).toEqual(['Ava', 'Leo', 'Priya', 'Sam', 'Jordan', 'Maya'])
    expect(t).toContain(`${copy.tier['contact-soon']} Reported a red-flag symptom`)
    expect(t).toContain(`${copy.tier['worth-a-look']} 2 flare-ups in 3 days`)
    expect(t).toContain('3 bends past the limit')
    expect(t).toContain(copy.nothingNew)
  })

  test('each patient has a recovery progress bar that says the phase, and a button into the chart', () => {
    const html = page()
    expect(html.match(/role="progressbar"/g)).toHaveLength(patients.length)
    expect(html).toContain('aria-valuetext="Phase 4 of 6: Bridge to sport"')
    expect(text(html)).toContain('Phase 3 of 6 · Build strength')
    expect(html).toContain(`href="${chartHref('ava-gave-way')}"`)
    expect(html).toContain(`aria-label="${copy.openChartFor('Ava')}"`)
    expect(html.match(/class="btn btn-secondary" href="#\/p\//g)).toHaveLength(patients.length)
  })

  test('the bar moves with the phases behind a patient and the checkpoints met in the current one', () => {
    const ava = patients.find((p) => p.id === 'ava-gave-way')!.path!
    const leo = patients.find((p) => p.id === 'leo-flare')!.path!
    expect(recoveryFraction(ava)).toBeCloseTo((ava.phase.n - 1 + ava.metCount / ava.requiredCount) / 6)
    expect(recoveryFraction(leo)).toBeCloseTo((leo.phase.n - 1 + leo.metCount / leo.requiredCount) / 6)
    expect(recoveryFraction({ ...leo, state: 'complete' })).toBe(1)
    expect(recoveryFraction({ ...leo, requiredCount: 0, metCount: 0 })).toBeCloseTo((leo.phase.n - 1) / 6)
  })

  test('says it is sample data, on the page and in the footer', () => {
    const t = text(page())
    expect(t).toContain(copy.sampleTag)
    expect(t).toContain(copy.sampleNote)
    expect(t).toContain(copy.footer)
  })

  test('opens on the table when nobody is picked, and for a link to someone who is not on it', () => {
    expect(text(page())).toContain(copy.colRecovery)
    expect(text(page('nobody'))).toContain(copy.colRecovery)
    expect(text(page('nobody'))).not.toContain(copy.backToAll)
  })
})

describe('a patient chart', () => {
  test('the summary leads with what needs attention, in the patient’s words, before progress', () => {
    const html = page('ava-gave-way')
    const t = text(html)
    expect(t).toContain('Ava ACL reconstruction · week 10 · Netball')
    expect(t).toContain('In their words: "Knee gave way on the stairs".')
    expect(html).toContain('role="alert"')
    expect(t.indexOf(copy.tier['contact-soon'])).toBeLessThan(t.indexOf(copy.progressTitle))
    expect(t).not.toContain(copy.colProcedure)
  })

  test('has three tabs, one clear action and a way back', () => {
    const html = page('leo-flare')
    for (const view of ['detail', 'log', 'exercises'] as const) expect(html).toContain(`href="${chartHref('leo-flare', view)}"`)
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(text(html)).toContain(`${copy.tab.detail} ${copy.tab.log} ${copy.tab.exercises}`)
    expect(html).toContain(`href="${chartHref('leo-flare', 'plan')}"`)
    expect(text(html)).toContain(copy.planEdit)
    expect(text(html)).toContain(copy.backToAll)
  })

  test('the summary shows the phase, the numbers and the open checkpoints', () => {
    const t = text(page('leo-flare'))
    expect(t).toContain('Leo ACL reconstruction · week 7 · Football')
    expect(t).toContain('Phase 3 of 6: Build strength')
    expect(t).toContain(copy.heldBack)
    expect(t).toContain('No pain or swelling after workouts')
    expect(t).toContain('A reaction in the last 7 days')
    expect(t).toContain('Phase 4 (Bridge to sport) opens once these are met')
    expect(t).not.toContain(copy.colMorning)
  })

  test('lists the in-clinic checkpoints apart, for the next visit', () => {
    const t = text(page('ava-gave-way'))
    const forClinic = t.slice(t.indexOf(copy.forClinic))
    expect(forClinic).toContain('Quad strength ≥80% of other leg')
    expect(forClinic).toContain(copy.by.pt)
  })

  test('the daily log is the last seven days as a table, newest first, with the week in a sentence', () => {
    const html = page('leo-flare', 'log')
    const t = text(html)
    expect(t).toContain('4 flare-up mornings')
    expect(t).toContain(`${copy.colDay} ${copy.colMorning} ${copy.colActivity} ${copy.colPain}`)
    expect(html.match(/class="day-name"/g)).toHaveLength(7)
    expect(t).toContain('Flare-up, pain 5')
    expect(t).not.toContain(copy.progressTitle)
  })

  test('shows the bend limit while one is in force, and the tape readings on the daily log', () => {
    expect(text(page('priya-meniscus'))).toContain(`${copy.bendLimit} 90°`)
    expect(text(page('priya-meniscus', 'log'))).toMatch(/bend 9\d° past 90°/)
  })

  test('the summary and the daily log count the same seven days', () => {
    const ava = patients.find((p) => p.id === 'ava-gave-way')!
    expect(ava.week.summary.weekEnd).toBe(TODAY)
    expect(ava.week.summary.painLogCount).toBe(ava.ring.painLogs)
  })

  test('a patient without a checkpoint protocol still shows, on the table and on the chart', () => {
    const base = emptyDataset(TODAY)
    const other = patientSummary('x', { ...base, profile: { ...base.profile, name: 'Kai', injury: 'tennis-elbow', injuryDate: '2026-10-01' } }, TODAY)
    expect(text(renderToStaticMarkup(<Clinic today={TODAY} patients={[other]} selectedId={undefined} />))).toContain(copy.noProtocolShort)
    const html = renderToStaticMarkup(<Clinic today={TODAY} patients={[other]} selectedId="x" />)
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
    expect(selectionFromHash(chartHref('leo-flare', 'log'))).toEqual({ id: 'leo-flare', view: 'log' })
    expect(selectionFromHash(chartHref('a b/c', 'exercises'))).toEqual({ id: 'a b/c', view: 'exercises' })
  })

  test('relative days read naturally', () => {
    expect([TODAY, '2026-11-11', '2026-11-09', '2026-11-01'].map((d) => relativeDay(d, TODAY))).toEqual(['today', 'yesterday', '3 days ago', 'Nov 1'])
  })
})
