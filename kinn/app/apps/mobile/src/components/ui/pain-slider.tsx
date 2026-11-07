import { useState } from 'react'
import { View } from 'react-native'
import type { GestureResponderEvent } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

import { Txt } from './txt'
import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const MAX = 10
const THUMB = 28
const TRACK_H = 8

interface PainSliderProps {
  readonly value: number | undefined
  readonly onChange: (value: number) => void
}

/** 0 to 10 along a green-to-orange line. Nothing is chosen until it is touched, because a rating is optional. */
export function PainSlider({ value, onChange }: PainSliderProps) {
  const colors = useColors()
  const [width, setWidth] = useState(0)

  const pick = (e: GestureResponderEvent) => {
    if (width <= 0) return
    const n = Math.max(0, Math.min(MAX, Math.round((e.nativeEvent.locationX / width) * MAX)))
    if (n !== value) {
      tapFeedback()
      onChange(n)
    }
  }

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm, minHeight: 44 }}>
        {value === undefined ? (
          <Txt color="textMuted">{copy.pain.pickOne}</Txt>
        ) : (
          <>
            <Txt kind="mono" style={{ fontSize: 36, lineHeight: 44 }}>
              {value}
            </Txt>
            <Txt color="textSecondary">{copy.pain.scaleWord(value)}</Txt>
          </>
        )}
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={copy.pain.title}
        accessibilityValue={value === undefined ? {} : { min: 0, max: MAX, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => onChange(Math.max(0, Math.min(MAX, (value ?? 0) + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: THUMB + 8, justifyContent: 'center' }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={pick}
        onResponderMove={pick}>
        <View pointerEvents="none">
          <Svg width="100%" height={TRACK_H}>
            <Defs>
              <LinearGradient id="pain-track" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.good} />
                <Stop offset="0.5" stopColor={colors.caution} />
                <Stop offset="1" stopColor={colors.warn} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={TRACK_H} rx={TRACK_H / 2} fill="url(#pain-track)" />
          </Svg>
        </View>
        {value !== undefined ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: Math.max(0, Math.min(width - THUMB, (value / MAX) * width - THUMB / 2)), width: THUMB, height: THUMB, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.text }}
          />
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt kind="label" color="textMuted">{`0 · ${copy.pain.scaleLow}`}</Txt>
        <Txt kind="label" color="textMuted">{`10 · ${copy.pain.scaleHigh}`}</Txt>
      </View>
    </View>
  )
}
