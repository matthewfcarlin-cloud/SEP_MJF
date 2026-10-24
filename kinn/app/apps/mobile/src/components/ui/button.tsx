import { Pressable } from 'react-native'
import type { PressableProps, StyleProp, ViewStyle } from 'react-native'

import { Txt } from './txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends Omit<PressableProps, 'style'> {
  readonly label: string
  readonly variant?: Variant
  readonly style?: StyleProp<ViewStyle>
}

export function Button({ label, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const colors = useColors()
  const bg = variant === 'primary' ? colors.accent : variant === 'secondary' ? colors.surfaceRaised : 'transparent'
  const fg = variant === 'primary' ? 'onAccent' : variant === 'secondary' ? 'text' : 'textSecondary'
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: 14,
          paddingHorizontal: space.lg,
          alignItems: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
        style,
      ]}
      {...rest}>
      <Txt kind="bodyStrong" color={fg}>
        {label}
      </Txt>
    </Pressable>
  )
}
