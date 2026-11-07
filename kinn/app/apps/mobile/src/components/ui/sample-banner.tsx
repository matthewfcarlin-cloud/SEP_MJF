import { Platform, Pressable, View } from 'react-native'

import { Txt } from './txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

/** Shown on every tab while on sample data, with one tap back to the person's own. The browser demo has no real data to go back to. */
export function SampleBanner() {
  const { mode, setMode } = useStore()
  const colors = useColors()
  if (mode !== 'sample') return null
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: space.md }}>
      <Txt kind="label" color="onAccent">
        {copy.sample.banner}
      </Txt>
      {Platform.OS === 'web' ? null : (
        <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setMode('real')}>
          <Txt kind="small" color="onAccent">
            {copy.sample.back}
          </Txt>
        </Pressable>
      )}
    </View>
  )
}
