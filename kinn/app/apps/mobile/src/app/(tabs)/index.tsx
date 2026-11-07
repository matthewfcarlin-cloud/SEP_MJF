import { router } from 'expo-router'
import { Platform, Pressable, View } from 'react-native'

import { TapeLiveCard } from '@/components/tape/live-card'
import { LoadCard } from '@/components/today/load-card'
import { MorningAsks } from '@/components/today/morning-asks'
import { BackupCard, QuietCard } from '@/components/today/notices'
import { PlanCard } from '@/components/today/plan-card'
import { FirstRead, ReadCard } from '@/components/today/read-card'
import { RedFlagCard } from '@/components/today/red-flag'
import { TodayHeader } from '@/components/today/header'
import { WarningCard } from '@/components/today/warning-card'
import { WeekStrip } from '@/components/today/week-strip'
import { Screen } from '@/components/ui/screen'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

/** One tap saves the time first; the detail sheet that follows is all optional. */
function PainButton() {
  const { pressPain } = useStore()
  const colors = useColors()
  const press = () => {
    const id = pressPain()
    successFeedback()
    router.push({ pathname: '/pain', params: { id, fresh: '1' } })
  }
  return (
    <View style={{ gap: space.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={copy.today.painButtonHint}
        onPress={press}
        style={({ pressed }) => ({ backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: space.md, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
        <Txt kind="bodyStrong" color="onAccent" style={{ fontSize: 17 }}>
          {copy.today.painButton}
        </Txt>
      </Pressable>
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {copy.today.painButtonHint}
      </Txt>
    </View>
  )
}

export default function TodayScreen() {
  const { view } = useStore()
  if (view.redFlag) {
    return (
      <Screen>
        <TodayHeader />
        <WeekStrip />
        <RedFlagCard log={view.redFlag} />
        <PainButton />
        <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
          {copy.inDevelopment}
        </Txt>
      </Screen>
    )
  }
  return (
    <Screen>
      <TodayHeader />
      <WeekStrip />
      <QuietCard />
      <MorningAsks />
      {view.firstDay ? <FirstRead index={1} /> : <ReadCard index={1} />}
      <WarningCard index={2} />
      {Platform.OS === 'web' ? <TapeLiveCard index={2} /> : null}
      <PlanCard index={3} />
      <PainButton />
      <LoadCard index={4} />
      <BackupCard />
    </Screen>
  )
}
