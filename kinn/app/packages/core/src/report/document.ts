/**
 * The one-page PT report as self-contained HTML, printed to PDF on the phone.
 * Brand: paper background, ink type, Geist with system fallbacks, status dots,
 * the disclaimer in the footer. The athlete chooses which sections go in.
 */
import { DISCLAIMER } from '../copy/disclaimer'
import type { Dataset, ManualActivity } from '../manual/types'
import { jointOf } from '../manual/types'
import type { PlanView } from '../plan/build'
import type { WeekChange, WeeklySummary } from './weekly'
import { weekHeadline } from './weekly'

export interface ReportSections {
  readonly days: boolean
  readonly range: boolean
  readonly pain: boolean
  readonly plan: boolean
  readonly notes: boolean
}

export const DEFAULT_SECTIONS: ReportSections = { days: true, range: true, pain: true, plan: true, notes: false }

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const ACTIVITY: Readonly<Record<ManualActivity, string>> = { practice: 'Practice', game: 'Game', gym: 'Gym', pt: 'PT', walking: 'Walking', rest: 'Rest' }
const MORNING_COLOUR = { clear: '#6F9E68', some: '#C99A3A', flare: '#D4673F', none: '#C9C5BA' } as const

export interface ReportInput {
  readonly data: Dataset
  readonly summary: WeeklySummary
  readonly change: WeekChange
  readonly plan: PlanView
  readonly sections: ReportSections
  /** Generated date, YYYY-MM-DD. */
  readonly generated: string
}

export function reportHtml(input: ReportInput): string {
  const { data, summary, change, plan, sections } = input
  const p = data.profile
  const who = [p.name && p.name !== 'there' ? p.name : 'RECO athlete', `${jointOf(p)}${p.side ? ` (${p.side})` : ''}`, p.injury.toUpperCase().replace('-', ' ')].join(' · ')
  const rows = summary.rows
    .map((r) => `<tr><td>${esc(r.load.date.slice(5))}</td><td class="bar"><span style="width:${r.load.score}%"></span></td><td class="num">${r.load.score}</td><td><i style="background:${MORNING_COLOUR[r.morning]}"></i></td><td>${esc(r.activities.map((a) => ACTIVITY[a]).join(', ') || '—')}</td></tr>`)
    .join('')
  const pains = data.painLogs.filter((x) => x.date >= summary.weekStart && x.date <= summary.weekEnd)
  const painRows = pains
    .map((x) => `<tr><td>${esc(x.date.slice(5))}</td><td class="num">${x.pain}</td><td>${esc(x.doing ?? '')}</td><td>${esc(x.settled ? `Settled: ${x.settled}` : '')}</td>${sections.notes ? `<td>${esc(x.note ?? '')}</td>` : ''}</tr>`)
    .join('')
  const notes = (data.journal ?? []).filter((j) => j.date >= summary.weekStart && j.date <= summary.weekEnd)
  const done = plan.week.flatMap((d) => d.items).filter((i) => i.done).length
  const planned = plan.week.flatMap((d) => d.items).length
  const block = (on: boolean, title: string, body: string): string => (on ? `<section><h2>${title}</h2>${body}</section>` : '')
  return `<!doctype html><html><head><meta charset="utf-8"><title>RECO weekly report</title><style>
  body{margin:0;background:#FBFAF7;color:#1C1E1A;font:13px/1.45 Geist,-apple-system,system-ui,sans-serif}
  main{padding:36px 40px;max-width:720px}
  header{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #E0DCD1;padding-bottom:12px}
  .brand{font-weight:700;letter-spacing:-.5px;font-size:20px}.mono,.num,h2,.meta{font-family:'Geist Mono',ui-monospace,Menlo,monospace}
  .meta{color:#686B62;font-size:11px}h1{font-size:22px;line-height:1.25;margin:20px 0 6px;font-weight:600}
  h2{font-size:10px;letter-spacing:.9px;text-transform:uppercase;color:#686B62;margin:22px 0 8px;font-weight:500}
  table{width:100%;border-collapse:collapse}td{padding:4px 6px;border-bottom:1px solid #EEEBE3;vertical-align:middle}
  .bar span{display:block;height:6px;border-radius:3px;background:#2F3A2C}.bar{width:42%}.num{text-align:right;width:40px}
  i{display:inline-block;width:8px;height:8px;border-radius:4px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .tile{background:#F2F1EC;border-radius:10px;padding:10px}.tile b{display:block;font:500 20px 'Geist Mono',ui-monospace,monospace}
  footer{margin-top:28px;border-top:1px solid #E0DCD1;padding-top:10px;color:#686B62;font-size:10px}
  </style></head><body><main>
  <header><span class="brand">RECO</span><span class="meta">${esc(summary.weekStart)} to ${esc(summary.weekEnd)} · generated ${esc(input.generated)}</span></header>
  <p class="meta">${esc(who)} · goal: ${esc(p.goal)}${p.ptName ? ` · for ${esc(p.ptName)}` : ''}</p>
  <h1>${esc(weekHeadline(summary, change))}</h1>
  ${p.story ? `<p class="meta">In their words: “${esc(p.story)}”</p>` : ''}
  <div class="grid">
    <div class="tile"><span class="meta">Avg load</span><b>${summary.avgScore}</b></div>
    <div class="tile"><span class="meta">Deepest bend</span><b>${summary.peakFlexionDeg ?? '—'}${summary.peakFlexionDeg ? '°' : ''}</b></div>
    <div class="tile"><span class="meta">Flare-up mornings</span><b>${summary.flares.length}</b></div>
    <div class="tile"><span class="meta">Plan sessions done</span><b>${done}/${planned}</b></div>
  </div>
  ${block(sections.days, 'Day by day · load and next morning', `<table>${rows}</table>`)}
  ${block(sections.range && summary.peakFlexionDeg !== undefined, 'Range via RECO tape', `<p>Best straightening ${summary.bestExtensionDeficitDeg}° short of full. Deepest bend ${summary.peakFlexionDeg}°.</p>`)}
  ${block(sections.pain, 'Pain logs', pains.length ? `<table>${painRows}</table>` : '<p>None logged.</p>')}
  ${block(sections.plan, `Plan · ${esc(plan.phaseName)}`, `<p>${plan.source === 'with-pt' ? 'Suggestions between visits; your plan comes first.' : 'Based on published rehab protocols.'}${plan.heldBack ? ' Held back a phase after recent flare-ups.' : ''}</p>`)}
  ${block(sections.notes && notes.length > 0, 'Journal', notes.map((n) => `<p><span class="meta">${esc(n.date.slice(5))}</span> ${esc(n.text)}</p>`).join(''))}
  <footer>${esc(DISCLAIMER)} Not a medical device. Load is estimated from logged activity and tape movement, not measured force.</footer>
  </main></body></html>`
}
