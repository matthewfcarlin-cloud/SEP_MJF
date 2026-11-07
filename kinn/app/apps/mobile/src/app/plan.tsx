import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle } from '@/components/ui/check'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { weekdayLetter } from '@/format'
import { FIND_PT_URL } from '@/links'
import { useStore } from '@/store/provider'
import { usePlan } from '@/store/use-plan'
import type { PlanDayModel } from '@/store/use-plan'
import { space } from '@/theme/tokens'

function WeekDots({ days, today }: { readonly days: readonly PlanDayModel[]; readonly today: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {days.map((d) => (
        <View key={d.date} style={{ alignItems: 'center', gap: 6 }}>
          <Txt kind="label" color={d.date === today ? 'text' : 'textMuted'}>
            {weekdayLetter(d.date)}
          </Txt>
          {d.rest ? <Txt color="textMuted">–</Txt> : <CheckCircle done={d.allDone} />}
        </View>
      ))}
    </View>
  )
}

function WherePhase() {
  const { view, state } = useStore()
  const phase = copy.plan.phase[view.plan.phase]
  const injury = copy.setup.injuries[state.data.profile.injury as keyof typeof copy.setup.injuries] ?? copy.setup.injuries.other
  return (
    <Screen variant="fullscreen" back={copy.settingsFlow.back} eyebrow={copy.plan.whereEyebrow(Math.floor(view.weeksSinceInjury), injury)} title={copy.plan.whereTitle}>
      <Card>
        <Txt kind="bodyStrong">{phase.title}</Txt>
        <Txt kind="small" color="textSecondary">
          {phase.body}
        </Txt>
      </Card>
      <Card>
        <Txt kind="bodyStrong">{copy.plan.noPtTitle}</Txt>
        <Txt kind="small" color="textSecondary">
          {copy.plan.noPtBody}
        </Txt>
        <Button label={copy.setup.findPt} variant="secondary" onPress={() => void WebBrowser.openBrowserAsync(FIND_PT_URL)} />
      </Card>
    </Screen>
  )
}

/** A generated plan is advice, and a red flag stops all advice. A PT's own exercises stay, since RECO only keeps count of them. */
function PlanPaused() {
  return (
    <Screen variant="fullscreen" back={copy.settingsFlow.back} title={copy.plan.title}>
      <Card>
        <Txt kind="bodyStrong">{copy.redFlag.title}</Txt>
        <Txt kind="small" color="textSecondary">
          {copy.plan.paused}
        </Txt>
      </Card>
    </Screen>
  )
}

export default function PlanScreen() {
  const { state, today, view, togglePlanMark } = useStore()
  const plan = usePlan()
  if (plan.kind === 'none') return <WherePhase />
  if (plan.kind === 'guided' && view.redFlag) return <PlanPaused />

  const { ptName } = state.data.profile
  const eyebrow = plan.kind === 'guided' ? copy.plan.generated : ptName ? copy.plan.fromName(ptName) : copy.plan.fromYourPt
  const exercises = state.data.exercises ?? []
  const typed = plan.kind === 'typed'
  const open = (id: string) => router.push({ pathname: '/exercise', params: { id } })

  if (plan.empty) {
    return (
      <Screen variant="fullscreen" back={copy.settingsFlow.back} eyebrow={eyebrow} title={copy.plan.title} subtitle={copy.plan.noneScreenBody}>
        <Card>
          <Txt kind="bodyStrong">{copy.plan.noneTitle}</Txt>
          <Txt kind="small" color="textSecondary">
            {copy.plan.noneScreenSub}
          </Txt>
          <Button label={copy.plan.add} onPress={() => router.push('/exercise')} />
        </Card>
      </Screen>
    )
  }

  const detailOf = (id: string, detail: string): string => {
    const days = exercises.find((e) => e.id === id)?.daysPerWeek
    return days === undefined ? detail : copy.plan.detail(detail, days)
  }

  return (
    <Screen variant="fullscreen" back={copy.settingsFlow.back} eyebrow={eyebrow} title={copy.plan.title}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.xs }}>
          <Txt kind="mono">{copy.plan.weekCount(plan.done, plan.planned).replace(' this week', '')}</Txt>
          <SectionLabel>{copy.plan.thisWeek}</SectionLabel>
        </View>
        <WeekDots days={plan.week} today={today} />
      </Card>
      <Card style={{ gap: 0 }}>
        <SectionLabel spaced>{copy.plan.today}</SectionLabel>
        {plan.today.rest ? <ListRow title={copy.plan.rest} sub={copy.plan.restSub} /> : null}
        {plan.today.rows.map((row) => (
          <ListRow key={row.id} title={row.name} sub={detailOf(row.id, row.detail)} right={<CheckCircle done={row.done} label={row.name} onPress={() => togglePlanMark(row.id)} />} />
        ))}
      </Card>
      {plan.tomorrow && !plan.tomorrow.rest ? (
        <Card style={{ gap: 0 }}>
          <SectionLabel spaced>{copy.plan.tomorrow}</SectionLabel>
          {plan.tomorrow.rows.map((row) => (
            <ListRow key={row.id} title={row.name} sub={row.detail} />
          ))}
        </Card>
      ) : null}
      {typed ? (
        <Card style={{ gap: 0 }}>
          <SectionLabel spaced>{copy.plan.allExercises}</SectionLabel>
          {exercises.map((e) => (
            <ListRow key={e.id} title={e.name} sub={copy.plan.detail(`${e.sets} sets of ${e.reps}`, e.daysPerWeek)} onPress={() => open(e.id)} />
          ))}
        </Card>
      ) : null}
      {typed ? <Button label={copy.plan.add} variant="secondary" onPress={() => router.push('/exercise')} /> : null}
      <Txt kind="small" color="textSecondary">
        {typed ? copy.plan.ptCanChange : copy.plan.guidedNote}
      </Txt>
      {typed ? null : (
        <Txt kind="small" color="textMuted">
          {copy.inDevelopment}
        </Txt>
      )}
    </Screen>
  )
}
