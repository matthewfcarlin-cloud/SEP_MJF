import { Pressable, View } from 'react-native'

import { Txt } from './txt'
import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface NumberScaleProps {
  readonly value: number | undefined
  readonly onChange: (n: number) => void
  readonly lowLabel: string
  readonly highLabel: string
}

/** Cells 0..10 rise in height and warm in colour toward the top of the scale, so the shape reads before the numbers do. */
export function NumberScale({ value, onChange, lowLabel, highLabel }: NumberScaleProps) {
  const colors = useColors()
  const toneFor = (n: number): string => (n <= 2 ? colors.good : n <= 5 ? colors.caution : colors.warn)
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ minHeight: 28, justifyContent: 'flex-end' }}>
        <Txt kind="heading" color={value === undefined ? 'textMuted' : 'text'}>
          {value === undefined ? copy.pain.pickOne : `${value} · ${copy.pain.scaleWord(value)}`}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end' }}>
        {Array.from({ length: 11 }, (_, n) => {
          const selected = value === n
          const tone = toneFor(n)
          const height = 36 + n * 3
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`Pain ${n}, ${copy.pain.scaleWord(n)}`}
              accessibilityState={{ selected }}
              onPress={() => {
                tapFeedback()
                onChange(n)
              }}
              style={({ pressed }) => ({
                flex: 1,
                height,
                borderRadius: radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? tone : colors.surfaceRaised,
                borderWidth: 1,
                borderColor: selected ? tone : `${tone}55`,
                opacity: pressed ? 0.75 : 1,
              })}>
              <Txt kind="small" style={{ color: selected ? colors.onStatus : colors.text }}>
                {n}
              </Txt>
            </Pressable>
          )
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt kind="small" color="textMuted">
          {lowLabel}
        </Txt>
        <Txt kind="small" color="textMuted">
          {highLabel}
        </Txt>
      </View>
    </View>
  )
}
