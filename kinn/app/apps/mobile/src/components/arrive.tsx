import { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import { FADE_MS, POP } from '@/theme/motion'

interface ArriveProps {
  /** Flips to true to play the arrival; content keeps its space before that, so nothing jumps. */
  readonly shown: boolean
  readonly delayMs?: number
  /** pop: scales up with a little overshoot (a word landing). rise: fades up a few points (text). */
  readonly kind?: 'pop' | 'rise'
  readonly style?: StyleProp<ViewStyle>
  readonly children: ReactNode
}

const POP_FROM_SCALE = 0.85
const RISE_FROM_Y = 8

/** One item arriving inside a hero moment. Shown from the start when `shown` is already true. */
export function Arrive({ shown, delayMs = 0, kind = 'rise', style, children }: ArriveProps) {
  const progress = useSharedValue(shown ? 1 : 0)

  useEffect(() => {
    if (!shown) return
    const to = kind === 'pop' ? withSpring(1, POP) : withTiming(1, { duration: FADE_MS })
    progress.set(withDelay(delayMs, to))
  }, [shown, delayMs, kind, progress])

  const animated = useAnimatedStyle(() => {
    const p = progress.get()
    return {
      opacity: Math.min(1, p),
      transform: kind === 'pop' ? [{ scale: POP_FROM_SCALE + (1 - POP_FROM_SCALE) * p }] : [{ translateY: (1 - p) * RISE_FROM_Y }],
    }
  })

  return <Animated.View style={[style, animated]}>{children}</Animated.View>
}
