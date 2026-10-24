import { Pressable, View } from 'react-native'

import { Txt } from './txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface NumberScaleProps {
  readonly value: number | undefined
  readonly onChange: (n: number) => void
  readonly lowLabel: string
  readonly highLabel: string
}

/** 0..10 pain scale as eleven tappable cells. */
export function NumberScale({ value, onChange, lowLabel, highLabel }: NumberScaleProps) {
  const colors = useColors()
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: 11 }, (_, n) => {
          const selected = value === n
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`Pain ${n}`}
              accessibilityState={{ selected }}
              onPress={() => onChange(n)}
              style={({ pressed }) => ({
                flex: 1,
                aspectRatio: 0.8,
                borderRadius: radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? colors.accent : colors.surfaceRaised,
                borderWidth: 1,
                borderColor: selected ? colors.accent : colors.border,
                opacity: pressed ? 0.75 : 1,
              })}>
              <Txt kind="small" color={selected ? 'onAccent' : 'text'}>
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
