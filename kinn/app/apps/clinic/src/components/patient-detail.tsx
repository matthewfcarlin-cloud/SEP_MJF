import { RING_DAYS } from '@reco/core'
import type { PatientSummary, ShareScope } from '@reco/core'
import { useState } from 'react'

import { copy } from '../copy'
import { notShared } from '../live'
import { FlagList } from './flags'
import { NextStepsSection } from './next-steps'
import { PlanSection } from './plan-section'
import { ProgressSection } from './progress'
import { RingPanel } from './ring-panel'
import { WeekSection } from './week'

interface PatientDetailProps {
  readonly patient: PatientSummary
  readonly today: string
  readonly nowHour: number
  readonly animateRing: boolean
  readonly onEditPlan: () => void
  /** Real patients only: what this patient chose to share, so an empty section isn't read as a quiet week. */
  readonly scopes?: readonly ShareScope[]
}

/** The open patient: the week as a ring (held in view) beside flags, progress and next steps; the days below. */
export function PatientDetail({ patient, today, nowHour, animateRing, onEditPlan, scopes }: PatientDetailProps) {
  const [selectedDay, setSelectedDay] = useState(RING_DAYS - 1)
  return (
    <article className="main" aria-labelledby="patient-name">
      <header className="patient-head">
        <h1 id="patient-name" tabIndex={-1}>{patient.name}</h1>
        <p className="patient-facts">{`${patient.surgeryLabel} · week ${Math.floor(patient.weeksIn)} · ${patient.sport}`}</p>
        {scopes ? <p className="small muted sharing-line">{copy.sharing(scopes.map((s) => copy.scope[s]), notShared(scopes).map((s) => copy.scope[s]))}</p> : null}
      </header>
      <div className="body">
        <div className="ring-col">
          <RingPanel ring={patient.ring} nowHour={nowHour} selectedDay={selectedDay} onSelectDay={setSelectedDay} animate={animateRing} patientId={patient.id} />
        </div>
        <div className="side">
          <FlagList flags={patient.flags} today={today} />
          <ProgressSection patient={patient} today={today} />
          <NextStepsSection patient={patient} />
          <PlanSection patient={patient} onEdit={onEditPlan} />
        </div>
      </div>
      <WeekSection patient={patient} />
    </article>
  )
}
