import { View } from 'react-native'
import type { Status } from '@reco/core'

import { Txt } from './txt'
import { copy } from '@/copy'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export const statusColor: Record<Status, ColorToken> = {
  'keep-going': 'good',
  steady: 'caution',
  'ease-off': 'warn',
}

interface StatusPillProps {
  readonly status: Status
  readonly large?: boolean
  readonly align?: 'flex-start' | 'center'
}

export function StatusPill({ status, large = false, align = 'flex-start' }: StatusPillProps) {
  const colors = useColors()
  const tone = colors[statusColor[status]]
  return (
    <View
      style={{
        alignSelf: align,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingVertical: large ? 10 : 6,
        paddingHorizontal: large ? space.md : 12,
        borderRadius: radius.pill,
        backgroundColor: `${tone}22`,
        borderWidth: 1,
        borderColor: `${tone}66`,
      }}>
      <View style={{ width: large ? 10 : 8, height: large ? 10 : 8, borderRadius: radius.pill, backgroundColor: tone }} />
      <Txt kind={large ? 'heading' : 'small'} style={{ color: tone }}>
        {copy.status[status]}
      </Txt>
    </View>
  )
}
