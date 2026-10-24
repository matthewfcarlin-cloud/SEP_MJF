import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import Svg, { Ellipse } from 'react-native-svg'
import type { Swelling } from '@kinn/core'

import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NumberScale } from '@/components/ui/number-scale'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const LEVELS: readonly Swelling[] = ['none', 'some', 'a-lot']
const KNEE_RX: Record<Swelling, number> = { none: 18, some: 24, 'a-lot': 30 }

/** Placeholder picture scale: a kneecap outline that gets puffier. Replace with Figma illustrations. */
function KneePicture({ level, selected }: { readonly level: Swelling; readonly selected: boolean }) {
  const colors = useColors()
  const rx = KNEE_RX[level]
  return (
    <Svg width={72} height={72} viewBox="0 0 72 72">
      <Ellipse cx={36} cy={36} rx={rx} ry={rx * 0.85} fill={selected ? colors.accent : colors.surfaceRaised} stroke={selected ? colors.accent : colors.textMuted} strokeWidth={2} />
      <Ellipse cx={36} cy={34} rx={9} ry={7} fill={selected ? colors.onAccent : colors.textMuted} opacity={0.6} />
    </Svg>
  )
}

export default function CheckInScreen() {
  const { setCheckIn } = useStore()
  const colors = useColors()
  const [pain, setPain] = useState<number | undefined>(undefined)
  const [swelling, setSwelling] = useState<Swelling | undefined>(undefined)

  const save = () => {
    if (pain === undefined || !swelling) return
    setCheckIn(pain, swelling)
    router.back()
  }

  return (
    <Screen modal title={copy.checkIn.title}>
      <Card>
        <SectionLabel>{copy.checkIn.painTitle}</SectionLabel>
        <NumberScale value={pain} onChange={setPain} lowLabel={copy.pain.scaleLow} highLabel={copy.pain.scaleHigh} />
      </Card>
      <Card>
        <SectionLabel>{copy.checkIn.swellingTitle}</SectionLabel>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {LEVELS.map((level) => {
            const selected = swelling === level
            return (
              <Pressable
                key={level}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSwelling(level)}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  gap: space.xs,
                  padding: space.sm,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent : colors.border,
                  opacity: pressed ? 0.75 : 1,
                })}>
                <KneePicture level={level} selected={selected} />
                <Txt kind="bodyStrong">{copy.checkIn.swelling[level]}</Txt>
                <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
                  {copy.checkIn.swellingHint[level]}
                </Txt>
              </Pressable>
            )
          })}
        </View>
      </Card>
      <Button label={copy.checkIn.save} disabled={pain === undefined || !swelling} onPress={save} />
    </Screen>
  )
}
