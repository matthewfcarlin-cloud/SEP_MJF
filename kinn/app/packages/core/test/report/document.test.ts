import { reportHtml, DEFAULT_SECTIONS } from '../../src/report/document'
import { weekChange, weeklySummary } from '../../src/report/weekly'
import { seedDataset } from '../../src/sim/seed'
import { containsBannedWord } from '../../src/copy/banned'
import { DISCLAIMER } from '../../src/copy/disclaimer'

const TODAY = '2026-11-04'
const data = { ...seedDataset(TODAY), profile: { ...seedDataset(TODAY).profile, ptName: 'Lena <script>' } }
const html = (sections = DEFAULT_SECTIONS) =>
  reportHtml({ data, summary: weeklySummary(data, '2026-11-03'), change: weekChange(data, '2026-11-03'), plan: { done: 3, planned: 5, note: 'From their PT.' }, loggedDaysThisWeek: 6, sections, generated: TODAY })

describe('reportHtml', () => {
  test('is one self-contained page with the headline, tiles and disclaimer', () => {
    const h = html()
    expect(h.startsWith('<!doctype html>')).toBe(true)
    expect(h).toContain('Flare-up mornings')
    expect(h).toContain('Not a medical device')
    expect(h).not.toMatch(/<link|<script src/)
  })
  test('escapes everything the athlete typed', () => {
    expect(html()).toContain('Lena &lt;script&gt;')
    expect(html()).not.toContain('<script>')
  })
  test('leaves out sections that are switched off', () => {
    expect(html({ ...DEFAULT_SECTIONS, pain: false })).not.toContain('Pain logs')
    expect(html()).toContain('Pain logs')
  })
  test('keeps their own words out unless notes are on', () => {
    const withStory = { ...data, profile: { ...data.profile, story: 'I tore it in March' } }
    const render = (notes: boolean) =>
      reportHtml({ data: withStory, summary: weeklySummary(withStory, '2026-11-03'), change: weekChange(withStory, '2026-11-03'), loggedDaysThisWeek: 6, sections: { ...DEFAULT_SECTIONS, notes }, generated: TODAY })
    expect(render(false)).not.toContain('I tore it in March')
    expect(render(true)).toContain('I tore it in March')
  })
  test('a section switched off leaves no trace in the tiles or headline', () => {
    const summary = weeklySummary(data, '2026-11-03')
    const h = reportHtml({ data, summary, change: weekChange(data, '2026-11-03'), plan: { done: 3, planned: 5, note: '' }, loggedDaysThisWeek: 6, sections: { ...DEFAULT_SECTIONS, range: false, plan: false }, generated: TODAY })
    expect(h).not.toContain('Deepest bend')
    expect(h).not.toContain('Plan sessions')
    expect(h).not.toMatch(/\bbend\b/i)
    expect(h).not.toMatch(/straighten/i)
  })
  test('says so at the top when little was logged', () => {
    const h = reportHtml({ data, summary: weeklySummary(data, '2026-11-03'), change: weekChange(data, '2026-11-03'), loggedDaysThisWeek: 2, sections: DEFAULT_SECTIONS, generated: TODAY })
    expect(h).toContain('Only 2 days logged')
  })
  test('report text has no banned words outside the required disclaimer', () => {
    const text = html().replace(/<[^>]+>/g, ' ').split(DISCLAIMER).join('')
    expect(containsBannedWord(text)).toBe(false)
  })
})
