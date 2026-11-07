import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { EveningWord } from '@reco/core'

import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { successFeedback, tapFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const WORDS: readonly EveningWord[] = ['quiet', 'sore', 'worse']
const TONE: Readonly<Record<EveningWord, ColorToken>> = { quiet: 'good', sore: 'caution', worse: 'warn' }

export default function EveningSheet() {
  const { state, today, setEvening } = useStore()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const earlier = state.data.eveningChecks?.find((c) => c.date === today)?.word
  const [word, setWord] = useState<EveningWord | undefined>(earlier)
  const save = () => {
    if (!word) return
    setEvening(word)
    successFeedback()
    router.back()
  }
  return (
    <View style={{ backgroundColor: colors.bg, padding: space.md, paddingTop: space.lg, paddingBottom: insets.bottom + space.md, gap: space.sm }}>
      <SectionLabel>{copy.evening.eyebrow}</SectionLabel>
      <Txt kind="title" style={{ fontSize: 24, lineHeight: 30, marginBottom: space.sm }}>
        {copy.evening.title}
      </Txt>
      {WORDS.map((w) => {
        const selected = word === w
        return (
          <Pressable
            key={w}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              tapFeedback()
              setWord(w)
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.accent : colors.border }}>
            <View style={{ width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors[TONE[w]] }} />
            <View style={{ flex: 1 }}>
              <Txt kind="bodyStrong">{copy.evening.options[w].title}</Txt>
              <Txt kind="small" color="textSecondary">
                {copy.evening.options[w].sub}
              </Txt>
            </View>
          </Pressable>
        )
      })}
      <Button label={copy.evening.save} disabled={!word} onPress={save} style={{ marginTop: space.sm }} />
    </View>
  )
}
