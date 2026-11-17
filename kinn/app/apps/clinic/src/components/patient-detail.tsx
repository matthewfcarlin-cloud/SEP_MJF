import type { PatientSummary, ShareScope } from '@reco/core'

import { copy } from '../copy'
import { notShared } from '../live'
import { chartHref, LIST_HREF } from '../use-selection'
import type { ChartView } from '../use-selection'
import { FlagList } from './flags'
import { BackIcon } from './icons'
import { NextStepsSection } from './next-steps'
import { PlanSection } from './plan-section'
import { ProgressSection } from './progress'
import { WeekSection } from './week'

export type ChartTab = Exclude<ChartView, 'plan'>
const TABS: readonly ChartTab[] = ['detail', 'log', 'exercises']

interface PatientDetailProps {
  readonly patient: PatientSummary
  readonly today: string
  readonly tab: ChartTab
  /** Real patients only: what this patient chose to share, so an empty section isn't read as a quiet week. */
  readonly scopes?: readonly ShareScope[]
}

/** One patient's chart: who they are, one clear action, and three tabs so each view holds one thing. */
export function PatientDetail({ patient, today, tab, scopes }: PatientDetailProps) {
  const hasPtPlan = patient.writtenPlan.source === 'pt'
  return (
    <main className="page" aria-labelledby="patient-name">
      <a className="back-link" href={LIST_HREF}><BackIcon />{copy.backToAll}</a>
      <header className="page-head">
        <div className="page-title">
          <h1 id="patient-name" tabIndex={-1}>{patient.name}</h1>
          <p className="patient-facts">{`${patient.surgeryLabel} · week ${Math.floor(patient.weeksIn)} · ${patient.sport}`}</p>
          {scopes ? <p className="small muted">{copy.sharing(scopes.map((s) => copy.scope[s]), notShared(scopes).map((s) => copy.scope[s]))}</p> : null}
        </div>
        <a className="btn btn-primary" href={chartHref(patient.id, 'plan')}>{hasPtPlan ? copy.planEdit : copy.planWrite}</a>
      </header>
      <nav className="tabs" aria-label={copy.tabsLabel}>
        {TABS.map((t) => (
          <a key={t} className="tab" href={chartHref(patient.id, t)} aria-current={t === tab ? 'page' : undefined}>
            {copy.tab[t]}
          </a>
        ))}
      </nav>
      {tab === 'detail' ? (
        <>
          <FlagList flags={patient.flags} today={today} />
          <ProgressSection patient={patient} today={today} />
          <NextStepsSection patient={patient} />
        </>
      ) : tab === 'log' ? (
        <WeekSection patient={patient} />
      ) : (
        <PlanSection patient={patient} />
      )}
    </main>
  )
}
