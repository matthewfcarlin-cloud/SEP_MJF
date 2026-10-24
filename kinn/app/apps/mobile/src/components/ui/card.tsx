import Animated, { FadeInDown } from 'react-native-reanimated'
import type { ViewProps } from 'react-native'

import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface CardProps extends ViewProps {
  readonly raised?: boolean
  /** Stagger index for the entrance animation. */
  readonly index?: number
}

const STAGGER_MS = 60

export function Card({ style, raised = false, index = 0, ...rest }: CardProps) {
  const colors = useColors()
  return (
    <Animated.View
      entering={FadeInDown.duration(320).delay(index * STAGGER_MS)}
      style={[
        {
          backgroundColor: raised ? colors.surfaceRaised : colors.surface,
          borderRadius: radius.lg,
          padding: space.md,
          gap: space.sm,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    />
  )
}
