import { Pressable, View } from 'react-native'
import type { ReactNode } from 'react'

import { Txt } from './txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface ChipProps {
  readonly label: string
  readonly selected: boolean
  readonly onPress: () => void
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const colors = useColors()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: space.md,
        borderRadius: radius.pill,
        backgroundColor: selected ? colors.accent : colors.surfaceRaised,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.border,
        opacity: pressed ? 0.75 : 1,
      })}>
      <Txt kind="small" color={selected ? 'onAccent' : 'text'}>
        {label}
      </Txt>
    </Pressable>
  )
}

export function ChipRow({ children }: { readonly children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{children}</View>
}
