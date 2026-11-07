import { SymbolView } from 'expo-symbols'
import { Pressable, View } from 'react-native'
import type { ReactNode } from 'react'

import { Txt } from './txt'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface ListRowProps {
  readonly title: string
  readonly sub?: string
  readonly right?: ReactNode
  /** Draws a chevron and makes the row a button. */
  readonly onPress?: () => void
  readonly first?: boolean
  readonly titleColor?: 'text' | 'warn'
}

export function ListRow({ title, sub, right, onPress, first = false, titleColor = 'text' }: ListRowProps) {
  const colors = useColors()
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: colors.border }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt kind="bodyStrong" color={titleColor}>
          {title}
        </Txt>
        {sub ? (
          <Txt kind="small" color="textSecondary">
            {sub}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress ? <SymbolView name="chevron.right" size={13} tintColor={colors.textMuted} /> : null)}
    </View>
  )
  if (!onPress) return body
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  )
}
