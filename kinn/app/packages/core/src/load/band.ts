import type { Band } from '../domain/types'
import { BAND_ANCHORS, PERSONALISE } from './constants'

const round = (n: number): number => Math.round(n)

/** Protocol band for a week since surgery, or undefined outside the anchor table. */
export function protocolBand(weeksSinceSurgery: number): Band | undefined {
  const first = BAND_ANCHORS[0]
  const last = BAND_ANCHORS[BAND_ANCHORS.length - 1]
  if (!first || !last) return undefined
  if (weeksSinceSurgery < first.week || weeksSinceSurgery > last.week) return undefined

  for (let i = 0; i < BAND_ANCHORS.length - 1; i++) {
    const a = BAND_ANCHORS[i]
    const b = BAND_ANCHORS[i + 1]
    if (!a || !b) continue
    if (weeksSinceSurgery >= a.week && weeksSinceSurgery <= b.week) {
      const f = (weeksSinceSurgery - a.week) / (b.week - a.week)
      return {
        lower: round(a.lower + f * (b.lower - a.lower)),
        upper: round(a.upper + f * (b.upper - a.upper)),
        source: 'protocol',
      }
    }
  }
  return { lower: last.lower, upper: last.upper, source: 'protocol' }
}

const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length

/**
 * After 14 wear days, pull the protocol band toward the athlete's own chronic
 * (28-day) mean and apply the acute:chronic guard so the upper bound never
 * exceeds 1.3× chronic. A guard that would invert the band is relaxed to keep
 * a minimum width, preferring the guard over the protocol.
 */
export function personaliseBand(protocol: Band, scoreHistory: readonly number[]): Band {
  if (scoreHistory.length < PERSONALISE.minWearDays) return protocol

  const recent = scoreHistory.slice(-PERSONALISE.chronicDays)
  const chronic = mean(recent)
  const protocolCentre = (protocol.lower + protocol.upper) / 2
  const width = protocol.upper - protocol.lower
  const centre = PERSONALISE.protocolWeight * protocolCentre + PERSONALISE.chronicWeight * chronic

  let lower = centre - width / 2
  let upper = centre + width / 2
  upper = Math.min(upper, PERSONALISE.acwrUpper * chronic)
  lower = Math.max(lower, PERSONALISE.acwrLower * chronic)
  if (upper - lower < PERSONALISE.minWidth) {
    lower = upper - PERSONALISE.minWidth
  }

  return { lower: round(Math.max(0, lower)), upper: round(Math.min(100, upper)), source: 'personalised' }
}

export interface ResolveBandInput {
  readonly weeksSinceSurgery: number
  readonly history: readonly number[]
  readonly physioBand?: { readonly lower: number; readonly upper: number }
}

/** Physio band wins and is never personalised; otherwise protocol, personalised when possible. */
export function resolveBand(input: ResolveBandInput): Band | undefined {
  if (input.physioBand) {
    return { lower: input.physioBand.lower, upper: input.physioBand.upper, source: 'physio' }
  }
  const protocol = protocolBand(input.weeksSinceSurgery)
  if (!protocol) return undefined
  return personaliseBand(protocol, input.history)
}
