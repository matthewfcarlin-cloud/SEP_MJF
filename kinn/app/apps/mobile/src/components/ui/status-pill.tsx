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
  /** The word for this guidance level. Defaults to the status name. */
  readonly word?: string
  readonly large?: boolean
  readonly align?: 'flex-start' | 'center'
}

/**
 * Today's read as a word plus its colour. Large: a dot and the word, no chip (Today).
 * Small: a tinted chip. The word stays in ink so it reads on the light page at any status.
 */
export function StatusPill({ status, word, large = false, align = 'flex-start' }: StatusPillProps) {
  const colors = useColors()
  const tone = colors[statusColor[status]]
  return (
    <View
      style={{
        alignSelf: align,
        flexDirection: 'row',
        alignItems: 'center',
        gap: large ? 10 : space.sm,
        paddingVertical: large ? 0 : 5,
        paddingHorizontal: large ? 0 : 12,
        borderRadius: radius.pill,
        backgroundColor: large ? 'transparent' : `${tone}2E`,
      }}>
      <View style={{ width: large ? 10 : 8, height: large ? 10 : 8, borderRadius: radius.pill, backgroundColor: tone }} />
      <Txt kind={large ? 'heading' : 'small'}>{word ?? copy.status[status]}</Txt>
    </View>
  )
}
