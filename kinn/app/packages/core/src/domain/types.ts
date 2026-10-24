/**
 * Kinn domain types. Pure data, no behaviour, no React Native.
 * Records are immutable: functions in this package return new objects.
 */

export type Knee = 'left' | 'right'
export type Level = 'pro' | 'college' | 'recreational'
export type Graft = 'patellar' | 'hamstring' | 'quad' | 'allograft' | 'unknown'

export interface AthleteProfile {
  readonly id: string
  readonly knee: Knee
  readonly injury: 'acl-reconstruction' | 'other-knee'
  readonly graft: Graft
  /** ISO date (YYYY-MM-DD) when known. */
  readonly surgeryDate?: string
  /** Midpoint of a 2-week bucket when the exact date is unknown. */
  readonly weeksSinceSurgeryEstimate?: number
  readonly level: Level
  readonly createdAt: string
}

export type DeviceKind = 'simulated' | 'replay' | 'ble-two-imu' | 'ble-strip'

export interface Device {
  readonly id: string
  readonly kind: DeviceKind
  readonly name: string
  readonly firmware?: string
}

export interface Calibration {
  readonly zeroOffsetDeg: number
  readonly signFlipped: boolean
  readonly at: string
}

export interface WearSession {
  readonly id: string
  readonly deviceId: string
  readonly startedAt: string
  readonly endedAt?: string
  readonly calibration: Calibration
}

/** One sensor reading. angleDeg: 0 = straight leg, positive = flexion. */
export interface KneeSample {
  readonly t: number
  readonly angleDeg: number
  readonly shinAccelG: number
}

/** Movement class of a bend cycle. Session tagging is kept separately. */
export type Activity = 'walking' | 'cycling' | 'stairs' | 'bend' | 'impact' | 'unknown'

export type SessionKind = 'pt' | 'training'

export interface TaggedSession {
  readonly id: string
  readonly kind: SessionKind
  readonly startedAt: number
  readonly endedAt?: number
  /** Mutes range alerts while true (physio pushing range on purpose). */
  readonly supervised: boolean
}

/** The unit of movement storage: one flexion excursion of >= 30 degrees. */
export interface BendCycle {
  readonly id: string
  readonly startT: number
  readonly endT: number
  readonly peakDeg: number
  readonly troughDeg: number
  readonly peakAccelG: number
  readonly activity: Activity
  readonly sessionKind?: SessionKind
  /** Milliseconds above the week's deep-flexion threshold within this cycle. */
  readonly deepFlexionMs: number
  readonly overRange: boolean
}

export interface RangeExcursion {
  readonly id: string
  readonly t: number
  readonly peakDeg: number
  readonly limitDeg: number
  readonly notified: boolean
}

export type RangeSource = 'protocol-default' | 'athlete-lowered' | 'physio'

/** Append-only. null limit = no range limit this week. */
export interface RangeSetting {
  readonly id: string
  readonly limitDeg: number | null
  readonly source: RangeSource
  readonly setBy?: string
  readonly effectiveFrom: string
}

export interface TargetBandSetting {
  readonly id: string
  readonly lower: number
  readonly upper: number
  readonly setBy: string
  readonly effectiveFrom: string
}

/** Breakdown rows shown to the athlete. */
export type Component = Activity | 'pt' | 'training' | 'deepFlexion' | 'overRange'

export interface ComponentTotal {
  readonly units: number
  readonly count: number
}

export type BandSource = 'protocol' | 'personalised' | 'physio'

export interface Band {
  readonly lower: number
  readonly upper: number
  readonly source: BandSource
}

export type Call = 'room-to-push' | 'on-target' | 'ease-off' | 'not-enough-data' | 'no-target'

export interface DailyLoad {
  /** Local date key with the 04:00 day boundary applied. */
  readonly date: string
  readonly modelVersion: string
  readonly rawUnits: number
  readonly score: number
  readonly components: Readonly<Partial<Record<Component, ComponentTotal>>>
  readonly band?: Band
  readonly call: Call
  readonly reason: string
  /** 0..1 of the active day (07:00 to 22:00) with data, so far. */
  readonly wearCoverage: number
  readonly partial: boolean
  readonly excursions: number
}

export type Feeling = 'sharp' | 'ache' | 'unstable' | 'swollen' | 'stiff' | 'note'

export interface Moment {
  readonly id: string
  readonly t: number
  readonly angleDeg: number
  /** Up to 60 s of angle before the press, 1 Hz. */
  readonly precedingAngles: readonly number[]
  readonly activity: Activity
  readonly scoreSoFar: number
  readonly feeling?: Feeling
  /** 0..10 */
  readonly pain?: number
  readonly note?: string
  readonly taggedAt?: number
}

export type Swelling = 'none' | 'some' | 'a-lot'

export interface CheckIn {
  readonly date: string
  readonly swelling: Swelling
  readonly note?: string
}

export interface Insight {
  readonly id: string
  readonly window: '7d' | '30d'
  readonly text: string
  readonly support: number
  readonly flareUpIds: readonly string[]
  readonly generatedAt: number
}

export interface OtherKneeCheck {
  readonly id: string
  readonly date: string
  readonly knee: Knee
  readonly peakDeg: number
  readonly medianPeakDeg: number
  readonly cyclesRecorded: number
}

export interface Checkpoint {
  readonly id: string
  readonly label: string
  readonly targetDeg?: number
  readonly typicalWeek?: number
  readonly unlocks?: string
  readonly setBy: 'default' | string
}

export interface ShareSettings {
  readonly load: boolean
  readonly flareUps: boolean
  readonly range: boolean
  readonly symmetry: boolean
  readonly sessions: boolean
  readonly moments: boolean
  readonly momentNotes: boolean
}

export interface FlareUp {
  readonly moment?: Moment
  readonly checkIn?: CheckIn
  readonly date: string
  readonly t: number
  readonly id: string
}

export interface WeeklyReport {
  readonly weekStart: string
  readonly weekEnd: string
  readonly days: readonly DailyLoad[]
  readonly flareUps: readonly { readonly flareUp: FlareUp; readonly precedingDays: readonly DailyLoad[] }[]
  readonly deepestBendByDay: readonly { readonly date: string; readonly peakDeg: number; readonly overRangeCount: number }[]
  readonly symmetry?: { readonly injured: OtherKneeCheck; readonly other: OtherKneeCheck }
  readonly sessions: readonly TaggedSession[]
  readonly moments: readonly Moment[]
  readonly settings: ShareSettings
  readonly coverageNote: string
}
