import { router } from 'expo-router'
import { Pressable, View } from 'react-native'

import { Card } from '@/components/ui/card'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

function AskButton({ title, sub, onPress }: { readonly title: string; readonly sub: string; readonly onPress: () => void }) {
  const colors = useColors()
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flex: 1, gap: 2, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.7 : 1 })}>
      <Txt kind="bodyStrong" style={{ fontSize: 14, lineHeight: 20 }}>
        {title}
      </Txt>
      <Txt kind="small" color="textSecondary">
        {sub}
      </Txt>
    </Pressable>
  )
}

/** Both morning questions in one card, gone once answered. */
export function MorningAsks() {
  const { view } = useStore()
  const colors = useColors()
  const pending = view.pendingSettle[0]
  if (!pending && view.checkInDone) return null
  const both = pending !== undefined && !view.checkInDone
  const title = both ? copy.read.askBoth : pending ? copy.today.settlePrompt : copy.read.firstAskTitle
  return (
    <Card index={0} style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.live }} />
        <SectionLabel>{copy.today.morningFirst}</SectionLabel>
      </View>
      <Txt kind="bodyStrong">{title}</Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {pending ? <AskButton title={copy.today.settleShort} sub={copy.read.settleSub(view.lastNightPain)} onPress={() => router.push('/settle')} /> : null}
        {view.checkInDone ? null : <AskButton title={copy.read.firstAskAction} sub={both ? copy.read.checkInSub : copy.read.firstAskSub} onPress={() => router.push('/checkin')} />}
      </View>
    </Card>
  )
}
