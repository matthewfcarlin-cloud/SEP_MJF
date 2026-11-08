import { router } from 'expo-router'

import { Card } from '@/components/ui/card'
import { ListRow } from '@/components/ui/list-row'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { usePlan } from '@/store/use-plan'

/**
 * What sits under today's score, one row each: load, range and plan. Each row opens its own
 * screen, so Today stays one glance and the detail is a tap away.
 */
export function Contributors({ index }: { readonly index: number }) {
  const { view } = useStore()
  const plan = usePlan()
  const rom = view.latestRom
  const hasPlan = plan.kind !== 'none' && !plan.empty
  return (
    <Card index={index} style={{ gap: 0, paddingVertical: 4 }}>
      <ListRow first title={copy.simple.load} sub={copy.simple.loadValue(view.todayLoad.score, Math.round(view.baselineScore))} onPress={() => router.push('/log')} />
      {rom ? <ListRow title={copy.simple.range} sub={copy.simple.rangeValue(rom.flexionDeg, copy.read.straightValue(rom.extensionDeficitDeg))} onPress={() => router.push('/progress')} /> : null}
      {hasPlan ? <ListRow title={copy.simple.plan} sub={copy.simple.planValue(plan.done, plan.planned)} onPress={() => router.push('/plan')} /> : null}
    </Card>
  )
}
