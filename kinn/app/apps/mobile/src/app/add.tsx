import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'

import { ByHand } from '@/components/log/by-hand'
import { SayOrType } from '@/components/log/say-or-type'
import { Screen } from '@/components/ui/screen'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

type Way = 'say' | 'hand'
const WAYS: readonly Way[] = ['say', 'hand']
const WAY_LABEL: Readonly<Record<Way, string>> = { say: copy.simple.sayOrType, hand: copy.simple.byHand }

/** Two ways in, one switch between them. */
function WaySwitch({ way, onChange }: { readonly way: Way; readonly onChange: (w: Way) => void }) {
  const colors = useColors()
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised }}>
      {WAYS.map((w) => {
        const selected = w === way
        return (
          <Pressable
            key={w}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              tapFeedback()
              onChange(w)
            }}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.pill, backgroundColor: selected ? colors.surface : 'transparent', boxShadow: selected ? `0 1px 3px ${colors.text}1F` : undefined }}>
            <Txt kind="bodyStrong" color={selected ? 'text' : 'textSecondary'} style={{ fontSize: 15 }}>
              {WAY_LABEL[w]}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

/** The one way to add to the day, opened from Log. Closes itself once something is saved. */
export default function AddScreen() {
  const [way, setWay] = useState<Way>('say')
  const done = () => router.back()
  return (
    <Screen variant="modal" title={copy.simple.add}>
      <View style={{ gap: space.lg }}>
        <WaySwitch way={way} onChange={setWay} />
        {way === 'say' ? <SayOrType onSaved={done} /> : <ByHand onSaved={done} />}
      </View>
    </Screen>
  )
}
