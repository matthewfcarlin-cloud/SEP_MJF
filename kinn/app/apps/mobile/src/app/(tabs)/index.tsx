import { router } from 'expo-router'
import { Platform, Pressable } from 'react-native'

import { TapeLiveCard } from '@/components/tape/live-card'
import { Contributors } from '@/components/today/contributors'
import { TodayHeader } from '@/components/today/header'
import { TodayHero } from '@/components/today/hero'
import { REVEAL_CARDS_LEAD_MS, useMorningReveal } from '@/components/today/morning-reveal'
import { BackupCard, QuietCard } from '@/components/today/notices'
import { RedFlagCard } from '@/components/today/red-flag'
import { WarningCard } from '@/components/today/warning-card'
import { WeekStrip } from '@/components/today/week-strip'
import { CardLeadContext } from '@/components/ui/card'
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
    <Pressable
      accessibilityRole="button"
      accessibilityHint={copy.today.painButtonHint}
      onPress={press}
      style={({ pressed }) => ({ borderRadius: radius.pill, paddingVertical: space.md, alignItems: 'center', borderWidth: 1, borderColor: colors.warn, opacity: pressed ? 0.7 : 1 })}>
      <Txt kind="bodyStrong" style={{ fontSize: 17 }}>
        {copy.today.painButton}
      </Txt>
    </Pressable>
  )
}

/**
 * Today, like a sleep or strain app: the score, the word, one next step, then a few rows.
 * Anything else (a warning, a quiet week, a backup nudge) only shows when it applies.
 */
export default function TodayScreen() {
  const { view, today } = useStore()
  // Only a scored day has a reveal; on day 1 and red-flag days things come in as usual.
  const revealing = useMorningReveal(today, !view.firstDay && !view.redFlag)
  if (view.redFlag) {
    return (
      <Screen>
        <TodayHeader />
        <WeekStrip />
        <RedFlagCard log={view.redFlag} />
        <PainButton />
      </Screen>
    )
  }
  return (
    <Screen>
      <TodayHeader />
      <WeekStrip />
      <QuietCard />
      <TodayHero reveal={revealing} />
      <CardLeadContext value={revealing ? REVEAL_CARDS_LEAD_MS : 0}>
        <WarningCard index={1} />
        {Platform.OS === 'web' ? <TapeLiveCard index={1} /> : null}
        {view.firstDay ? null : <Contributors index={2} />}
        <PainButton />
        <BackupCard />
      </CardLeadContext>
    </Screen>
  )
}
