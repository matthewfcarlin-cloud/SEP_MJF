import { createContext, useContext } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'
import type { ViewProps } from 'react-native'

import { STAGGER_MS } from '@/theme/motion'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface CardProps extends ViewProps {
  readonly raised?: boolean
  /** Stagger index for the entrance animation. */
  readonly index?: number
}

const ENTER_MS = 320

/** Extra wait before cards enter, so they can follow a hero moment (the morning reveal). */
export const CardLeadContext = createContext(0)

export function Card({ style, raised = false, index = 0, ...rest }: CardProps) {
  const colors = useColors()
  const leadMs = useContext(CardLeadContext)
  return (
    <Animated.View
      entering={FadeInDown.duration(ENTER_MS).delay(leadMs + index * STAGGER_MS)}
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
