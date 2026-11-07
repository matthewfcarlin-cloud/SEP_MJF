/**
 * What Today says, by guidance level. The level is the largest product decision in the pilot:
 * patient-facing guidance sets the regulatory burden, so Descriptive and PT-led only ever show
 * facts from what was logged. Status words and suggestions appear only at Guided.
 */
import type { TodayView } from '../manual/derive'
import type { Status } from '../manual/types'
import type { PersonalLine, Warning } from '../warnings/line'

export type GuidanceLevel = 'descriptive' | 'pt-led' | 'guided'
export type ReadWord = 'Settled' | 'Mixed' | 'Flared' | 'Keep going' | 'Steady' | 'Ease off'

const DESCRIPTIVE_WORD: Readonly<Record<Status, ReadWord>> = { 'keep-going': 'Settled', steady: 'Mixed', 'ease-off': 'Flared' }
const GUIDED_WORD: Readonly<Record<Status, ReadWord>> = { 'keep-going': 'Keep going', steady: 'Steady', 'ease-off': 'Ease off' }

export const wordFor = (status: Status, guidance: GuidanceLevel): ReadWord =>
  (guidance === 'guided' ? GUIDED_WORD : DESCRIPTIVE_WORD)[status]

export interface DailyRead {
  readonly stage: 'first-day' | 'no-check-in' | 'read'
  readonly word?: ReadWord
  readonly facts: string
  readonly suggestion?: string
}

function loadFacts(view: TodayView): string {
  const y = view.yesterdayLoad.score
  if (y <= 0) return ''
  return view.baselineScore > 0 ? `Yesterday’s load ${y}, your usual is ${Math.round(view.baselineScore)}.` : `Yesterday’s load ${y}.`
}

function morningFacts(view: TodayView): string {
  const c = view.checkIn
  if (!c) return ''
  const last = view.lastNightPain
  const trend = last !== undefined && c.pain > last ? `, up from ${last} last night` : ''
  const swelling = c.swelling === 'some' ? ' Some swelling.' : c.swelling === 'a-lot' ? ' A lot of swelling.' : ''
  return `Morning pain ${c.pain}${trend}.${swelling}`
}

export function dailyRead(view: TodayView, guidance: GuidanceLevel): DailyRead {
  if (view.firstDay) return { stage: 'first-day', facts: 'Your first read comes after tomorrow’s check-in. Log what you can today. RECO needs a morning to compare with.' }
  if (!view.checkIn) {
    const facts = [loadFacts(view), 'Your read comes after your check-in.'].filter(Boolean).join(' ')
    return { stage: 'no-check-in', facts }
  }
  const unsettled = view.status.because === 'did-not-settle' ? 'Last night’s pain did not settle.' : ''
  const facts = [morningFacts(view), unsettled, loadFacts(view)].filter(Boolean).join(' ')
  const base = { stage: 'read' as const, word: wordFor(view.status.status, guidance), facts }
  return guidance === 'guided' ? { ...base, suggestion: view.suggestion } : base
}

export interface WarningCopy {
  readonly facts: string
  readonly action?: string
  readonly lineNote: string
}

export function warningCopy(warning: Warning, line: PersonalLine, guidance: GuidanceLevel): WarningCopy {
  const lineNote = line.source === 'personal' ? 'Your line comes from those flare-ups.' : 'Your line starts from your usual day until two flare-ups teach it.'
  const base = { facts: warning.why, lineNote }
  if (guidance === 'pt-led') return { ...base, action: 'Worth mentioning to your PT.' }
  if (guidance === 'guided') return { ...base, action: warning.suggestion }
  return base
}
