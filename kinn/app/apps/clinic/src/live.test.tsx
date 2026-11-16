import { catalogFor, DEFAULT_SHARE_SCOPES, sampleCaseload, scopedDataset } from '@reco/core'
import type { Dataset, SharedPatient, ShareScope } from '@reco/core'
import { renderToStaticMarkup } from 'react-dom/server'

import { Clinic } from './App'
import { SignIn } from './components/sign-in'
import { copy } from './copy'
import { liveCaseload, notShared, spacedCode } from './live'

const TODAY = '2026-11-12'
const text = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')
const sample = (id: string) => sampleCaseload(TODAY).find((p) => p.id === id)!.data
/** What the server sends a PT: the record cut to the share's scopes, with the latest published plan attached. */
const served = (id: string, scopes: readonly ShareScope[]): Dataset => {
  const full = sample(id)
  return { ...scopedDataset(full, scopes), ...(full.ptPlan ? { ptPlan: full.ptPlan } : {}) }
}

const shared: readonly SharedPatient[] = [
  { id: 'a1', name: 'Leo', sharedSince: '2026-11-01T10:00:00.000Z', scopes: ['range', 'pain'], updatedAt: '2026-11-12T08:00:00.000Z', data: served('leo-flare', ['range', 'pain']) },
  { id: 'b2', name: 'Maya', sharedSince: '2026-11-02T10:00:00.000Z', scopes: DEFAULT_SHARE_SCOPES, updatedAt: '2026-11-12T08:00:00.000Z', data: served('maya-on-track', DEFAULT_SHARE_SCOPES) },
  { id: 'c3', name: 'Ava', sharedSince: '2026-11-12T09:00:00.000Z', scopes: [] },
]
const caseload = liveCaseload(TODAY, shared)
const nothing = (): void => undefined
const chrome = { mode: 'live' as const, accountName: 'Dana Ruiz, PT', waiting: caseload.waiting, onAdd: nothing, onSignOut: nothing }
const page = (props: Partial<Parameters<typeof Clinic>[0]> = {}): string =>
  renderToStaticMarkup(<Clinic today={TODAY} nowHour={10} patients={caseload.patients} selectedId="a1" onSelect={nothing} chrome={chrome} scopes={caseload.scopes} {...props} />)

describe('real patients from the server', () => {
  test('synced patients are summarised, most urgent first; one whose phone hasn’t synced waits by name', () => {
    expect(caseload.patients.map((p) => p.id)).toEqual(['a1', 'b2'])
    expect(caseload.waiting).toEqual([{ id: 'c3', name: 'Ava', sharedSince: '2026-11-12T09:00:00.000Z', unreadable: false }])
    expect(caseload.scopes.a1).toEqual(['range', 'pain'])
    expect(liveCaseload(TODAY, [])).toEqual({ patients: [], waiting: [], scopes: {} })
  })

  test('the page says what a patient shares and what they left off', () => {
    expect(notShared(['range', 'pain'])).toEqual(['activity', 'notes', 'tape'])
    const t = text(page())
    expect(t).toContain('Shares check-ins, range and checkpoints, pain logs.')
    expect(t).toContain('Not shared: activity, notes in their own words, tape alerts.')
    expect(copy.sharing([], ['notes'])).toBe('Shares check-ins only. Not shared: notes.')
  })

  test('the rail is the PT’s own: no sample tag, a way to add a patient, who is signed in, who is waiting', () => {
    const t = text(page())
    expect(t).not.toContain(copy.sampleTag)
    expect(t).not.toContain(copy.sampleNote)
    expect(t).toContain(copy.liveNoteRail(3))
    expect(t).toContain(copy.addPatient)
    expect(t).toContain(copy.signedInAs('Dana Ruiz, PT'))
    expect(t).toContain(copy.signOut)
    expect(t).toContain(`${copy.waitingTitle} Ava ${copy.waitingRow}`)
    expect(t).toContain(copy.liveFooter)
  })

  test('the editor publishes as the signed-in PT, with no name to type, and says where the plan goes', () => {
    const html = page({ view: 'plan' })
    const t = text(html)
    expect(t).toContain(`${copy.publishingAs('Dana Ruiz, PT')}. ${copy.liveNote('Leo')}`)
    expect(html).not.toContain(copy.authorPlaceholder)
    expect(t).not.toContain(copy.backendNote)
  })

  test('adding a patient explains the code; an empty caseload opens on it', () => {
    const add = text(page({ view: 'add' }))
    expect(add).toContain(copy.addTitle)
    expect(add).toContain(copy.makeCode)
    expect(add).toContain(copy.backToList)
    const empty = text(page({ patients: [], selectedId: undefined, chrome: { ...chrome, waiting: [] } }))
    expect(empty).toContain(copy.emptyTitle)
    expect(empty).toContain(copy.emptyLead)
    expect(empty).not.toContain(copy.backToList)
  })

  test('while the caseload loads, or fails to, the page says so and offers nothing to act on', () => {
    const loading = text(page({ patients: [], selectedId: undefined, chrome: { ...chrome, waiting: [], loading: true } }))
    expect(loading).toContain(copy.loading)
    expect(loading).not.toContain(copy.emptyTitle)
    const failed = text(page({ patients: [], selectedId: undefined, chrome: { ...chrome, waiting: [], loadError: 'RECO’s server could not be reached.', onRetry: nothing } }))
    expect(failed).toContain(copy.loadFailed)
    expect(failed).toContain(copy.tryAgain)
    expect(failed).not.toContain(copy.emptyTitle)
  })

  test('a plan link for someone who isn’t on the list opens nobody’s editor', () => {
    const t = text(page({ view: 'plan', selectedId: 'someone-elses-patient' }))
    expect(t).not.toContain(copy.editorTitle('Leo'))
    expect(t).toContain(copy.ringTitle)
  })

  test('a record the server couldn’t open says so, instead of looking like a phone that hasn’t synced', () => {
    const broken = liveCaseload(TODAY, [{ id: 'd4', name: 'Sam', sharedSince: '2026-11-12T09:00:00.000Z', scopes: [], unreadable: true }])
    const t = text(page({ chrome: { ...chrome, waiting: broken.waiting } }))
    expect(t).toContain(copy.unreadableRow)
  })

  test('a sharing code is shown the way it is read out', () => {
    expect(spacedCode('ABCDEFGH')).toBe('ABCD EFGH')
  })
})

describe('signing in', () => {
  const html = (needsName: boolean): string =>
    renderToStaticMarkup(<SignIn onStart={async () => ({})} onVerify={async () => undefined} needsName={needsName} onName={async () => undefined} onSample={nothing} />)
  const render = (needsName: boolean): string => text(html(needsName))

  test('starts with an email and no password, with the sample patients one click away', () => {
    const t = render(false)
    expect(t).toContain(copy.signInTitle)
    expect(t).toContain(copy.signInLead)
    expect(t).toContain(copy.sendCode)
    expect(t).toContain(copy.lookAround)
    expect(html(false)).not.toContain('type="password"')
  })

  test('a new PT is asked for the name patients will see before anything else', () => {
    const t = render(true)
    expect(t).toContain(copy.nameTitle)
    expect(t).toContain(copy.nameLead)
    expect(t).not.toContain(copy.sendCode)
  })
})

describe('the plan editor, second pass', () => {
  const editor = renderToStaticMarkup(<Clinic today={TODAY} nowHour={10} patients={caseload.patients} selectedId="a1" view="plan" onSelect={nothing} />)

  test('the library opens on the patient’s phase and says how much more there is', () => {
    const total = catalogFor('knee').length
    const inPhase = catalogFor('knee').filter((c) => c.phase === 2).length
    expect(text(editor)).toContain(copy.libraryCount(inPhase, total))
    expect(text(editor)).toContain(`${copy.libraryCaution}: Protocols delay resisted hamstring work`)
    expect(editor).toContain(copy.librarySearchPlaceholder)
    expect(text(editor)).toContain(copy.category['hip-core'])
  })

  test('each exercise has labelled dose boxes, and a flare-up line only when the plan uses one', () => {
    expect(editor.match(/class="entry"/g)).toHaveLength(5)
    expect(editor).toContain('aria-label="Sets, Mini squats"')
    expect(editor.match(/class="entry-row entry-dose entry-light"/g)).toHaveLength(5)
    const asWritten = renderToStaticMarkup(<Clinic today={TODAY} nowHour={10} patients={caseload.patients} selectedId="b2" view="plan" onSelect={nothing} />)
    expect(asWritten).not.toContain('entry-light')
  })
})
