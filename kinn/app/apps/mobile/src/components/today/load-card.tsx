import { View } from 'react-native'

import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'

export function LoadCard({ index }: { readonly index: number }) {
  const { view } = useStore()
  const usual = Math.round(view.baselineScore)
  return (
    <Card index={index}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SectionLabel>{copy.today.loadTodayLabel}</SectionLabel>
        <SectionLabel>{copy.today.fromLogged}</SectionLabel>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
        <Txt kind="mono">{view.todayLoad.score}</Txt>
        {usual > 0 ? (
          <Txt kind="small" color="textSecondary">
            {copy.today.yourUsual(usual)}
          </Txt>
        ) : null}
      </View>
      <ProgressBar value={view.todayLoad.score} height={6} />
    </Card>
  )
}
