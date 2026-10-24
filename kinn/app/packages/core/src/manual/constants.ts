import type { Intensity, ManualActivity } from './types'

/** Knee work units per logged activity by intensity. Same 12,000-unit day anchor as the sensor model. */
export const MANUAL_UNITS: Readonly<Record<ManualActivity, Readonly<Record<Intensity, number>>>> = {
  rest: { light: 300, moderate: 300, hard: 300 },
  walking: { light: 1500, moderate: 2500, hard: 3500 },
  pt: { light: 2500, moderate: 3500, hard: 4500 },
  gym: { light: 3000, moderate: 4500, hard: 6000 },
  practice: { light: 4000, moderate: 6000, hard: 8000 },
  game: { light: 7000, moderate: 9000, hard: 11000 },
}

export const STATUS_RULES = {
  /** Morning pain at or above this is a flare-up and forces Ease off. */
  flarePain: 5,
  /** Morning pain at or above this holds the day at Steady. */
  steadyPain: 3,
  /** Yesterday's load above this multiple of the 7-day baseline holds the day at Steady. */
  spikeRatio: 1.3,
  baselineDays: 7,
} as const

export const ROM_TARGETS = {
  /** Extension deficit at or below this counts as fully straight. */
  straightDeg: 2,
  /** Deficit at which the extension part of progress is 0. */
  startDeficitDeg: 15,
  /** Flexion at which the flexion part of progress is 0 and 100. */
  startFlexionDeg: 90,
  fullFlexionDeg: 135,
  bikeFlexionDeg: 120,
  /** A typical ACL comeback, for the timeline part of the progress bar. */
  comebackWeeks: 36,
  progressWeights: { extension: 0.35, flexion: 0.35, timeline: 0.3 },
} as const

export const MANUAL_INSIGHTS = {
  minFlareUps: 2,
  minSupport: 0.67,
  maxConditionPrevalence: 0.5,
  maxShown: 3,
  highLoadScore: 75,
  windowDays: 30,
  /** Minimum gap between the two averages before the load-contrast sentence is shown. */
  minContrast: 15,
} as const
