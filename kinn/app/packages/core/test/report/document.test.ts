import { reportHtml, DEFAULT_SECTIONS } from '../../src/report/document'
import { weekChange, weeklySummary } from '../../src/report/weekly'
import { deriveToday } from '../../src/manual/derive'
import { seedDataset } from '../../src/sim/seed'
import { containsBannedWord } from '../../src/copy/banned'
import { DISCLAIMER } from '../../src/copy/disclaimer'

const TODAY = '2026-11-04'
const data = { ...seedDataset(TODAY), profile: { ...seedDataset(TODAY).profile, ptName: 'Lena <script>' } }
const view = deriveToday(data, TODAY)
const html = (sections = DEFAULT_SECTIONS) =>
  reportHtml({ data, summary: weeklySummary(data, '2026-11-03'), change: weekChange(data, '2026-11-03'), plan: view.plan, sections, generated: TODAY })

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
  test('report text has no banned words outside the required disclaimer', () => {
    const text = html().replace(/<[^>]+>/g, ' ').split(DISCLAIMER).join('')
    expect(containsBannedWord(text)).toBe(false)
  })
})
