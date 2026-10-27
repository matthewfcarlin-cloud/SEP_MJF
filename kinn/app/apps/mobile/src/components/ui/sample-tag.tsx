import { Pressable, View } from 'react-native'

import { Txt } from './txt'
import { copy } from '@/copy'
import { radius } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface SampleTagProps {
  readonly label?: string
  /** When set, the tag is a button (the web build opens the tape screen from it). */
  readonly onPress?: () => void
}

export function SampleTag({ label = copy.sampleData, onPress }: SampleTagProps) {
  const colors = useColors()
  const Wrap = onPress ? Pressable : View
  return (
    <Wrap
      {...(onPress ? { onPress, accessibilityRole: 'button' as const } : {})}
      style={{
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
      <Txt kind="label" color="textMuted">
        {label}
      </Txt>
    </Wrap>
  )
}
