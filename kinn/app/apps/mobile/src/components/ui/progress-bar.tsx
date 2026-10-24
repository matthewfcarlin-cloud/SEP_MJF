import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated'

import { radius } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface ProgressBarProps {
  /** 0..100 */
  readonly value: number
  readonly color?: ColorToken
  readonly height?: number
}

const FILL_MS = 700

/** Bar that fills from zero on mount and eases to any new value. */
export function ProgressBar({ value, color = 'accent', height = 10 }: ProgressBarProps) {
  const colors = useColors()
  const pct = Math.max(0, Math.min(100, value))
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withTiming(pct, { duration: FILL_MS, easing: Easing.out(Easing.cubic) })
  }, [pct, width])

  const fill = useAnimatedStyle(() => ({ width: `${width.value}%` }))

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={{ height, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', backgroundColor: colors[color], borderRadius: radius.pill }, fill]} />
    </View>
  )
}
