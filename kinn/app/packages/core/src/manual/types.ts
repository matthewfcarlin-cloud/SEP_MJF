/**
 * Manual-log MVP types. The athlete logs activities, pain and a morning
 * check-in by hand; range-of-motion days are simulated "via RECO tape".
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
  /** 0..10 */
  readonly pain: number
  readonly doing?: Doing
  /** Answer to the next-morning "Did it settle?" notification. */
  readonly settled?: Settled
  readonly settledAt?: number
}

export interface MorningCheckIn {
  readonly date: string
  /** 0..10 */
  readonly pain: number
  readonly swelling: Swelling
}

/** One day of simulated tape data. extensionDeficitDeg: 0 = fully straight. */
export interface RomDay {
  readonly date: string
  readonly extensionDeficitDeg: number
  readonly flexionDeg: number
  readonly source: 'reco-tape-sim'
}

export type Injury = 'acl' | 'meniscus' | 'other'

export interface Profile {
  readonly name: string
  readonly injury: Injury
  /** ISO date of injury or surgery. */
  readonly injuryDate: string
  readonly hadSurgery: boolean
  readonly sport: string
  readonly hasPt: boolean
  readonly goal: string
}

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
}
