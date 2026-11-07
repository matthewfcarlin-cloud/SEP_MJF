/**
 * Manual-log types. The person logs activities, pain and a morning check-in by hand,
 * and types in range measurements. Sample data simulates range instead.
 * All records are immutable.
 */
import type { Swelling } from '../domain/types'

export type ManualActivity = 'practice' | 'game' | 'gym' | 'pt' | 'walking' | 'rest'
export type Intensity = 'light' | 'moderate' | 'hard'

export interface ActivityLog {
  readonly id: string
  /** RECO day key (YYYY-MM-DD). */
  readonly date: string
  readonly activity: ManualActivity
  readonly intensity: Intensity
}

/** What the athlete was doing when it hurt. */
export type Doing = ManualActivity | 'stairs' | 'other'
export type Settled = 'yes' | 'a-bit' | 'no'

export interface PainLog {
  readonly id: string
  readonly t: number
  readonly date: string
  /** 0..10. Missing on a one-tap press with no detail, which still counts in patterns. */
  readonly pain?: number
  readonly doing?: Doing
  /** Answer to the next-morning "Did it settle?" notification. */
  readonly settled?: Settled
  readonly settledAt?: number
  /** 'press' is a pain-button press (device or app); 'evening' is the end-of-day update. */
  readonly kind?: 'press' | 'evening'
  readonly note?: string
  /** Local file URIs; never uploaded. */
  readonly voiceUri?: string
  readonly photoUri?: string
}

/** A voice or typed journal entry for the day, kept verbatim. */
export interface JournalEntry {
  readonly id: string
  readonly t: number
  readonly date: string
  readonly text: string
  readonly source: 'voice' | 'typed'
}

/** One plan item marked done, or skipped by choice with a reason. */
export interface PlanMark {
  readonly date: string
  readonly itemId: string
  readonly done: boolean
}

/** "That was wrong" on a warning: the athlete's correction, which loosens their line. */
export interface WarningFeedback {
  readonly date: string
  readonly t: number
  readonly kind: 'wrong' | 'helpful'
}

export interface MorningCheckIn {
  readonly date: string
  /** 0..10 */
  readonly pain: number
  readonly swelling: Swelling
}

/** Who measured a range day. 'reco-tape-sim' only ever appears in sample data. */
export type RomSource = 'pt' | 'self' | 'reco-tape-sim'

/** One day of range of motion. extensionDeficitDeg: 0 = fully straight. */
export interface RomDay {
  readonly date: string
  readonly extensionDeficitDeg: number
  readonly flexionDeg: number
  readonly source: RomSource
}

/** One exercise the person typed in from their PT. */
export interface PlanExercise {
  readonly id: string
  readonly name: string
  readonly sets: number
  readonly reps: number
  /** 1..7 */
  readonly daysPerWeek: number
  readonly note?: string
}

export type EveningWord = 'quiet' | 'sore' | 'worse'

/** The optional end-of-day answer. Sore and worse also add a pain log, so the morning ask follows. */
export interface EveningCheck {
  readonly date: string
  readonly word: EveningWord
}

export type Joint = 'knee' | 'shoulder' | 'elbow'
export type Side = 'left' | 'right'

/** Injury types RECO knows a published protocol for, per joint. 'other' falls back to the joint's general plan. */
export type Injury =
  | 'acl'
  | 'meniscus'
  | 'rotator-cuff'
  | 'shoulder-dislocation'
  | 'ucl'
  | 'tennis-elbow'
  | 'other'

export const INJURIES_BY_JOINT: Readonly<Record<Joint, readonly Injury[]>> = {
  knee: ['acl', 'meniscus', 'other'],
  shoulder: ['rotator-cuff', 'shoulder-dislocation', 'other'],
  elbow: ['ucl', 'tennis-elbow', 'other'],
}

export interface Profile {
  readonly name: string
  /** Missing on profiles saved before multi-joint onboarding; read it through `jointOf`. */
  readonly joint?: Joint
  readonly side?: Side
  readonly injury: Injury
  /** ISO date of injury or surgery. */
  readonly injuryDate: string
  readonly hadSurgery: boolean
  readonly sport: string
  readonly hasPt: boolean
  readonly goal: string
  /** The athlete's own words from voice or typed intake, kept for the PT report. */
  readonly story?: string
  readonly ptName?: string
  readonly ptEmail?: string
  /** ISO date of the next PT visit, for schedule send. */
  readonly nextVisit?: string
}

export const jointOf = (p: Pick<Profile, 'joint'>): Joint => p.joint ?? 'knee'

export type Status = 'keep-going' | 'steady' | 'ease-off'

export interface DayLoad {
  readonly date: string
  readonly units: number
  /** 0..100 */
  readonly score: number
}

export interface FlareDay {
  readonly date: string
  readonly reason: 'morning-pain' | 'swelling' | 'did-not-settle'
}

export interface Dataset {
  readonly profile: Profile
  readonly activityLogs: readonly ActivityLog[]
  readonly painLogs: readonly PainLog[]
  readonly checkIns: readonly MorningCheckIn[]
  readonly romDays: readonly RomDay[]
  /** Optional so states saved before these features still load. */
  readonly journal?: readonly JournalEntry[]
  readonly planMarks?: readonly PlanMark[]
  readonly warningFeedback?: readonly WarningFeedback[]
  readonly exercises?: readonly PlanExercise[]
  readonly eveningChecks?: readonly EveningCheck[]
}
