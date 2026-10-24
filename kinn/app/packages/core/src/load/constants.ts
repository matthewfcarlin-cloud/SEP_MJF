/**
 * Every tunable number in the load model lives here. Bump MODEL_VERSION whenever a
 * value changes so stored DailyLoad rows can be recomputed. All values are
 * assumptions until tuned with physios and wear data (feature-spec.md section 2.4).
 */

export const MODEL_VERSION = '0.1.0'

/** Units for a full training day on a healthy athletic knee. Score 100. */
export const HEALTHY_DAY_UNITS = 12_000

/** Minimum peak-to-trough excursion to count as a bend cycle. */
export const MIN_CYCLE_EXCURSION_DEG = 30

/** Base units per cycle by movement class. */
export const BASE_UNITS = {
  walking: 1.0,
  cycling: 0.5,
  stairs: 3.0,
  bend: 3.0,
  impact: 1.0,
  unknown: 1.0,
} as const

/** Impact adds 1.5 units per g above 1.5 g, minimum 0.5, on top of the base. */
export const IMPACT = { thresholdG: 2.5, perG: 1.5, baselineG: 1.5, minUnits: 0.5 } as const

/** Cycles inside a tagged PT or training session multiply base + impact units. */
export const SESSION_MULTIPLIER = 1.5

/** One unit per 10 s above the deep-flexion threshold. */
export const DEEP_FLEXION_UNITS_PER_MS = 1 / 10_000

/** Flat units per over-range excursion. */
export const OVER_RANGE_UNITS = 10

/** Deep-flexion threshold by week: 90 deg before week 8, 110 deg from week 8. */
export const DEEP_THRESHOLD = { earlyDeg: 90, lateDeg: 110, switchWeek: 8 } as const

/** Target band anchors by weeks since surgery, interpolated linearly between rows. */
export const BAND_ANCHORS: ReadonlyArray<{ week: number; lower: number; upper: number }> = [
  { week: 4, lower: 20, upper: 35 },
  { week: 6, lower: 25, upper: 40 },
  { week: 8, lower: 30, upper: 50 },
  { week: 10, lower: 35, upper: 55 },
  { week: 12, lower: 40, upper: 60 },
  { week: 14, lower: 45, upper: 65 },
  { week: 16, lower: 50, upper: 75 },
  { week: 20, lower: 60, upper: 85 },
  { week: 24, lower: 65, upper: 90 },
]

/** Personalisation after this many wear days. */
export const PERSONALISE = {
  minWearDays: 14,
  protocolWeight: 0.6,
  chronicWeight: 0.4,
  acwrUpper: 1.3,
  acwrLower: 0.8,
  minWidth: 5,
  chronicDays: 28,
} as const

/** Active day window used for wear coverage and the day profile. */
export const ACTIVE_DAY = { startHour: 7, endHour: 22 } as const

/** Local day boundary: the day rolls over at 04:00. */
export const DAY_BOUNDARY_HOUR = 4

export const CALL_RULES = {
  minCoverage: 0.6,
  /** Before this fraction of the active day has passed, the projection uses the band centre. */
  minDayFractionForProjection: 0.25,
  /** Minimum elapsed active minutes before coverage is judged at all. */
  minElapsedMinutesForCoverage: 60,
  easeOffExcursions: 3,
  easeOffPain: 5,
  flareUpPain: 5,
} as const

/** Default range-alert limit by week. null = no limit. Section 1.2 of the spec. */
export const RANGE_DEFAULTS: ReadonlyArray<{ fromWeek: number; toWeek: number; limitDeg: number | null }> = [
  { fromWeek: 0, toWeek: 5, limitDeg: 110 },
  { fromWeek: 6, toWeek: 7, limitDeg: 120 },
  { fromWeek: 8, toWeek: 9, limitDeg: 130 },
  { fromWeek: 10, toWeek: 12, limitDeg: 135 },
  { fromWeek: 13, toWeek: 999, limitDeg: null },
]

export const RANGE_ALERT = {
  marginDeg: 5,
  sustainMs: 500,
  mergeWithinMs: 10_000,
  notifyGapMs: 10 * 60_000,
  maxNotificationsPerDay: 6,
  muteMs: 90 * 60_000,
} as const

/** Cycle rates are per knee per minute (half the step rate). */
export const CLASSIFIER = {
  walking: { maxPeakDeg: 75, minRate: 35, maxRate: 75 },
  cycling: { minPeakDeg: 70, maxPeakDeg: 115, minRate: 45, maxRate: 115, maxAccelG: 1.3 },
  stairs: { minPeakDeg: 80, maxPeakDeg: 110, minRate: 15, maxRate: 55, minAccelG: 1.3 },
  bend: { maxRate: 25 },
} as const

export const MOMENTS = { cancelWithinMs: 10_000, precedingSeconds: 60 } as const

export const INSIGHTS = {
  minFlareUps: 2,
  minSupport: 0.67,
  maxConditionPrevalence: 0.5,
  maxShown: 2,
  nearActivityMs: 2 * 3600_000,
  highLoadScore: 75,
} as const
