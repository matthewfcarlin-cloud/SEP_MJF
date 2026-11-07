import { SymbolView } from 'expo-symbols'
import { Pressable, View } from 'react-native'

import { Txt } from './txt'
import { tapFeedback } from '@/haptics'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface CheckCircleProps {
  readonly done: boolean
  readonly size?: number
  readonly onPress?: () => void
  readonly label?: string
}

/** The round mark for plan items and milestones. Not done is only an empty circle, never a warning. */
export function CheckCircle({ done, size = 24, onPress, label }: CheckCircleProps) {
  const colors = useColors()
  const mark = (
    <View style={{ width: size, height: size, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.accent : 'transparent', borderWidth: done ? 0 : 1.5, borderColor: colors.textMuted }}>
      {done ? <SymbolView name="checkmark" size={size * 0.45} tintColor={colors.onAccent} /> : null}
    </View>
  )
  if (!onPress) return mark
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
      hitSlop={10}
      onPress={() => {
        tapFeedback()
        onPress()
      }}>
      {mark}
    </Pressable>
  )
}

interface CheckRowProps {
  readonly label: string
  readonly checked: boolean
  readonly onPress: () => void
}

/** A square tick box with its label, for consent. */
export function CheckRow({ label, checked, onPress }: CheckRowProps) {
  const colors = useColors()
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => {
        tapFeedback()
        onPress()
      }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 8 }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: checked ? colors.accent : 'transparent', borderWidth: checked ? 0 : 1.5, borderColor: colors.textMuted }}>
        {checked ? <SymbolView name="checkmark" size={11} tintColor={colors.onAccent} /> : null}
      </View>
      <Txt style={{ flex: 1 }}>{label}</Txt>
    </Pressable>
  )
}
