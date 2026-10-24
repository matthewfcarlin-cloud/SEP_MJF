import type { Swelling } from '../domain/types'
import { STATUS_RULES } from './constants'
import type { MorningCheckIn, Status } from './types'

export interface StatusInput {
  readonly checkIn: MorningCheckIn | undefined
  readonly yesterdayScore: number
  /** Mean score over the previous 7 logged days, 0 when unknown. */
  readonly baselineScore: number
  /** A pain log from yesterday was answered "did not settle". */
  readonly unsettledPain: boolean
}

export interface StatusResult {
  readonly status: Status
  readonly because: StatusReason
}

export type StatusReason =
  | 'morning-pain-high'
  | 'swelling-a-lot'
  | 'did-not-settle'
  | 'morning-pain-some'
  | 'swelling-some'
  | 'load-spike'
  | 'no-check-in'
  | 'all-clear'

const isSpike = (yesterday: number, baseline: number): boolean =>
  baseline > 0 && yesterday > STATUS_RULES.spikeRatio * baseline

const swellingIs = (checkIn: MorningCheckIn | undefined, level: Swelling): boolean =>
  checkIn?.swelling === level

/**
 * Today's status from the pain-monitoring rule physios already use: pain that
 * settled overnight is fine, pain that did not or swelling that rose means ease off.
 * Load only ever holds the day at Steady; it never forces Ease off on its own.
 */
export function statusFor(input: StatusInput): StatusResult {
  const pain = input.checkIn?.pain ?? 0
  if (pain >= STATUS_RULES.flarePain) return { status: 'ease-off', because: 'morning-pain-high' }
  if (swellingIs(input.checkIn, 'a-lot')) return { status: 'ease-off', because: 'swelling-a-lot' }
  if (input.unsettledPain) return { status: 'ease-off', because: 'did-not-settle' }
  if (pain >= STATUS_RULES.steadyPain) return { status: 'steady', because: 'morning-pain-some' }
  if (swellingIs(input.checkIn, 'some')) return { status: 'steady', because: 'swelling-some' }
  if (isSpike(input.yesterdayScore, input.baselineScore)) return { status: 'steady', because: 'load-spike' }
  if (!input.checkIn) return { status: 'steady', because: 'no-check-in' }
  return { status: 'keep-going', because: 'all-clear' }
}
