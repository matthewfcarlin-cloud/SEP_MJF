/**
 * One patient as a PT sees them: progress, next steps, the week, and flags. Built from the
 * same functions the patient app uses (deriveToday, the protocol path, the weekly report),
 * so the two never disagree.
 */
import { deriveToday } from '../manual/derive'
import type { Dataset, MorningCheckIn, OtherKnee, RomDay } from '../manual/types'
import type { CriterionView, PathView } from '../protocol/progress'
import { weekChange, weekHeadline, weeklySummary } from '../report/weekly'
import type { WeekChange, WeeklySummary } from '../report/weekly'
import { flagsFor, TIER_ORDER } from './flags'
import { weekRing } from './ring'
import type { WeekRing } from './ring'
import type { ClinicFlag, FlagTier } from './flags'

export interface NextSteps {
  /** One line on how the phase moves on. */
  readonly phaseLine: string
  /** Checkpoints still open in the current phase. */
  readonly open: readonly CriterionView[]
  /** The open ones only a clinician can measure. */
  readonly forClinic: readonly CriterionView[]
}

export interface PatientSummary {
  readonly id: string
  readonly name: string
  readonly sport: string
  readonly surgeryLabel: string
  readonly injuryDate: string
  readonly weeksIn: number
  readonly path: PathView | undefined
  /** Exercise-plan phase (1-4) and whether recent flare-ups held it back. */
  readonly plan: { readonly phase: number; readonly name: string; readonly heldBack: boolean }
  readonly latestRom: RomDay | undefined
  /** The uninjured knee, measured once; the "same as the other knee" checkpoints compare against it. */
  readonly otherKnee: OtherKnee | undefined
  readonly lastCheckIn: MorningCheckIn | undefined
  readonly flags: readonly ClinicFlag[]
  readonly topTier: FlagTier | undefined
  readonly nextSteps: NextSteps
  readonly week: { readonly summary: WeeklySummary; readonly change: WeekChange; readonly headline: string }
  /** The last seven days, ending today, for the Week Ring. */
  readonly ring: WeekRing
}

const INJURY_LABEL: Readonly<Record<string, string>> = {
  acl: 'ACL', meniscus: 'Meniscus', 'rotator-cuff': 'Rotator cuff', 'shoulder-dislocation': 'Shoulder dislocation', ucl: 'UCL', 'tennis-elbow': 'Tennis elbow', other: 'Other',
}

function surgeryLabel(data: Dataset, path: PathView | undefined): string {
  if (path) return path.protocol.name
  const injury = INJURY_LABEL[data.profile.injury] ?? 'Injury'
  return data.profile.hadSurgery ? `${injury} surgery` : `${injury}, no surgery`
}

function phaseLine(path: PathView | undefined, planName: string): string {
  if (!path) return `No checkpoint protocol for this injury; the plan is in its "${planName}" phase by time since injury.`
  const next = path.protocol.phases[path.phase.n]
  switch (path.state) {
    case 'complete':
      return 'Every checkpoint in the protocol is met. The return decision is yours and the surgeon’s.'
    case 'ready':
      return `All checkpoints met; moves to phase ${next?.n} (${next?.name}) the next time the app opens.`
    case 'ready-waiting-on-time':
      return `All checkpoints met; phase ${next?.n} (${next?.name}) opens at week ${path.nextPhaseOpensWeek}, the protocol’s healing floor.`
    case 'needs-pt':
      return 'Only in-clinic checks are left for this phase.'
    default:
      if (!next) return 'Final phase: these are the last checkpoints.'
      return path.weeksIn >= next.startsWeek
        ? `Phase ${next.n} (${next.name}) opens once these are met.`
        : `Phase ${next.n} (${next.name}) opens once these are met, and not before week ${next.startsWeek}.`
  }
}

/** The patient's last seven days ending today, the same window as the Week Ring, so every count agrees. */
function weekFor(data: Dataset, today: string): PatientSummary['week'] {
  const weekEnd = today
  const summary = weeklySummary(data, weekEnd)
  const change = weekChange(data, weekEnd)
  return { summary, change, headline: weekHeadline(summary, change) }
}

export function patientSummary(id: string, data: Dataset, today: string): PatientSummary {
  const view = deriveToday(data, today)
  const path = view.path
  const flags = flagsFor(data, today, path)
  const open = path ? path.criteria.filter((c) => c.criterion.required && c.status !== 'met') : []
  const lastCheckIn = [...data.checkIns].filter((c) => c.date <= today).sort((a, b) => a.date.localeCompare(b.date)).at(-1)
  return {
    id,
    name: data.profile.name,
    sport: data.profile.sport,
    surgeryLabel: surgeryLabel(data, path),
    injuryDate: data.profile.injuryDate,
    weeksIn: view.weeksSinceInjury,
    path,
    plan: { phase: view.plan.phase, name: view.plan.phaseName, heldBack: view.plan.heldBack },
    latestRom: view.latestRom,
    otherKnee: data.profile.otherKnee,
    lastCheckIn,
    flags,
    topTier: flags[0]?.tier,
    nextSteps: { phaseLine: phaseLine(path, view.plan.phaseName), open, forClinic: open.filter((c) => c.criterion.measuredBy === 'pt') },
    week: weekFor(data, today),
    ring: weekRing(data, today),
  }
}

/** Most urgent first; within a tier (or with no flags), by name. */
export function caseloadOrder(patients: readonly PatientSummary[]): readonly PatientSummary[] {
  const rank = (p: PatientSummary): number => (p.topTier ? TIER_ORDER[p.topTier] : Object.keys(TIER_ORDER).length)
  return [...patients].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}
