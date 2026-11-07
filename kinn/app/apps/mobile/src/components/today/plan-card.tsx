import { router } from 'expo-router'
import { Pressable, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle } from '@/components/ui/check'
import { ListRow } from '@/components/ui/list-row'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { usePlan } from '@/store/use-plan'
import { space } from '@/theme/tokens'

export function PlanCard({ index }: { readonly index: number }) {
  const { state, togglePlanMark } = useStore()
  const plan = usePlan()

  if (plan.kind === 'none') {
    return (
      <Card index={index}>
        <ListRow first title={copy.plan.whereTitle} sub={copy.plan.noPtTitle} onPress={() => router.push('/plan')} />
      </Card>
    )
  }
  if (plan.empty) {
    return (
      <Card index={index}>
        <SectionLabel>{copy.plan.todayLabel}</SectionLabel>
        <Txt kind="bodyStrong">{copy.plan.noneTitle}</Txt>
        <Txt kind="small" color="textSecondary">
          {copy.plan.noneBody}
        </Txt>
        <Button label={copy.plan.add} variant="secondary" onPress={() => router.push('/exercise')} />
      </Card>
    )
  }
  const source = plan.kind === 'typed' ? ` · ${copy.plan.fromPt}` : ''
  return (
    <Card index={index} style={{ gap: 0 }}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/plan')} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: space.sm }}>
        <SectionLabel>{copy.plan.todayLabel}</SectionLabel>
        <SectionLabel>{copy.plan.weekCount(plan.done, plan.planned)}</SectionLabel>
      </Pressable>
      {plan.today.rest ? <ListRow title={copy.plan.rest} sub={copy.plan.restSub} /> : null}
      {plan.today.rows.map((row) => (
        <ListRow key={row.id} title={row.name} sub={`${row.detail}${source}`} right={<CheckCircle done={row.done} label={row.name} onPress={() => togglePlanMark(row.id)} />} />
      ))}
      {state.guidance === 'pt-led' ? (
        <Txt kind="small" color="textSecondary" style={{ paddingTop: space.sm }}>
          {copy.plan.ptLedChange}
        </Txt>
      ) : null}
      {state.guidance === 'guided' ? (
        <View style={{ paddingTop: space.sm, gap: space.xs }}>
          <Txt kind="small" color="textSecondary">
            {copy.plan.guidedNote}
          </Txt>
          <Txt kind="small" color="textMuted">
            {copy.inDevelopment}
          </Txt>
        </View>
      ) : null}
    </Card>
  )
}
