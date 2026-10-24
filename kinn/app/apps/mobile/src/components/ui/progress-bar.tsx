import { View } from 'react-native'

import { radius } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface ProgressBarProps {
  /** 0..100 */
  readonly value: number
  readonly color?: ColorToken
  readonly height?: number
}

export function ProgressBar({ value, color = 'accent', height = 10 }: ProgressBarProps) {
  const colors = useColors()
  const pct = Math.max(0, Math.min(100, value))
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={{ height, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[color], borderRadius: radius.pill }} />
    </View>
  )
}
