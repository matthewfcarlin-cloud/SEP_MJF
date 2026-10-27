/**
 * Deterministic 21-day sample dataset for the demo. Everything here is
 * labelled SAMPLE DATA in the app. Pattern: three game days each followed
 * by a flare-up morning, one flare-up after a gym day, PT twice a week,
 * extension reaching fully straight around day 15, flexion climbing to ~128°.
 */
import { addDays, startOfDay } from '../time/day'
import type { ActivityLog, Dataset, Intensity, ManualActivity, MorningCheckIn, PainLog, Profile, RomDay } from '../manual/types'

export const SEED_DAYS = 21

export const SEED_PROFILE: Profile = {
  name: 'Maya',
  injury: 'acl',
  injuryDate: '2026-08-28',
  hadSurgery: true,
  sport: 'Soccer',
  hasPt: true,
  goal: 'Back on the pitch',
}

interface DayPlan {
  readonly activity: ManualActivity
  readonly intensity: Intensity
}

/** Index 0 is the oldest day (today minus 21), index 20 is yesterday. */
const PLAN: readonly DayPlan[] = [
  { activity: 'pt', intensity: 'moderate' }, // 0
  { activity: 'practice', intensity: 'moderate' }, // 1
  { activity: 'gym', intensity: 'moderate' }, // 2
  { activity: 'game', intensity: 'hard' }, // 3  -> flare on 4
  { activity: 'pt', intensity: 'light' }, // 4
  { activity: 'walking', intensity: 'light' }, // 5
  { activity: 'practice', intensity: 'moderate' }, // 6
  { activity: 'pt', intensity: 'moderate' }, // 7
  { activity: 'rest', intensity: 'light' }, // 8
  { activity: 'gym', intensity: 'moderate' }, // 9
  { activity: 'game', intensity: 'hard' }, // 10 -> flare on 11
  { activity: 'pt', intensity: 'light' }, // 11
  { activity: 'walking', intensity: 'moderate' }, // 12
  { activity: 'gym', intensity: 'hard' }, // 13 -> flare on 14
  { activity: 'pt', intensity: 'moderate' }, // 14
  { activity: 'practice', intensity: 'moderate' }, // 15
  { activity: 'rest', intensity: 'light' }, // 16
  { activity: 'game', intensity: 'hard' }, // 17 -> flare on 18
  { activity: 'pt', intensity: 'light' }, // 18
  { activity: 'gym', intensity: 'moderate' }, // 19
  { activity: 'practice', intensity: 'hard' }, // 20 (yesterday: load spike -> Steady today)
]

const FLARE_MORNINGS: Readonly<Record<number, { pain: number; swelling: MorningCheckIn['swelling'] }>> = {
  4: { pain: 6, swelling: 'some' },
  11: { pain: 5, swelling: 'a-lot' },
  14: { pain: 5, swelling: 'some' },
  18: { pain: 6, swelling: 'some' },
}

/** Small deterministic wobble in [-1, 1]. */
const wobble = (i: number): number => Math.sin(i * 12.9898) * 0.9

const romFor = (i: number): { extensionDeficitDeg: number; flexionDeg: number } => {
  const extension = Math.max(0, 8 - (8 * i) / 14 + wobble(i) * 0.6)
  const flexion = 95 + (33 * i) / SEED_DAYS + wobble(i + 7) * 1.5
  return { extensionDeficitDeg: Math.round(extension * 10) / 10, flexionDeg: Math.round(flexion) }
}

/** Build the dataset so that `today` is the day after the 21 seeded days. */
export function seedDataset(today: string): Dataset {
  const dateAt = (i: number): string => addDays(today, i - SEED_DAYS)

  const activityLogs: ActivityLog[] = PLAN.map((p, i) => ({
    id: `seed-act-${i}`,
    date: dateAt(i),
    activity: p.activity,
    intensity: p.intensity,
  }))

  // No check-in for today on purpose: the demo opens on the morning check-in card.
  const checkIns: MorningCheckIn[] = PLAN.map((_, i) => {
    const flare = FLARE_MORNINGS[i]
    return flare
      ? { date: dateAt(i), pain: flare.pain, swelling: flare.swelling }
      : { date: dateAt(i), pain: i % 3 === 0 ? 2 : 1, swelling: 'none' as const }
  })

  const gamePain: PainLog[] = PLAN.flatMap((p, i) => {
    if (p.activity !== 'game') return []
    const date = dateAt(i)
    return [
      {
        id: `seed-pain-${i}`,
        t: startOfDay(date, 21),
        date,
        pain: 6,
        doing: 'game' as const,
        settled: 'no' as const,
        settledAt: startOfDay(dateAt(i + 1), 8),
      },
    ]
  })
  // Last night's unanswered log, so the demo shows the "Did it settle?" card.
  const lastNight = dateAt(SEED_DAYS - 1)
  const painLogs: PainLog[] = [
    ...gamePain,
    { id: 'seed-pain-last-night', t: startOfDay(lastNight, 20) + 30 * 60_000, date: lastNight, pain: 4, doing: 'practice' as const },
  ]

  const romDays: RomDay[] = PLAN.map((_, i) => ({ date: dateAt(i), ...romFor(i), source: 'reco-tape-sim' as const }))

  return { profile: SEED_PROFILE, activityLogs, painLogs, checkIns, romDays }
}
