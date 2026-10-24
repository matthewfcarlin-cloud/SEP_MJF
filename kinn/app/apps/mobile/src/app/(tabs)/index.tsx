import { Link, router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Pressable, View } from 'react-native'

import { copy } from '@/copy'
import { weekdayLetter } from '@/format'
import { useStore } from '@/store/provider'
import { Bars } from '@/components/ui/bars'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { StatusPill, statusColor } from '@/components/ui/status-pill'
import { Txt } from '@/components/ui/txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

function SettingsLink() {
  const colors = useColors()
  return (
    <Link href="/settings" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={copy.settings.title} hitSlop={12}>
        <View style={{ width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name="gearshape" size={18} tintColor={colors.textSecondary} />
        </View>
      </Pressable>
    </Link>
  )
}

export default function TodayScreen() {
  const { view, state } = useStore()
  const colors = useColors()
  const { profile } = state.data
  const last7 = view.loads.slice(-7)

  return (
    <Screen title={copy.today.greeting(profile.name)} subtitle={copy.today.weekLabel(view.weeksSinceInjury)} right={<SettingsLink />}>
      {view.pendingSettle.length > 0 ? (
        <Card raised>
          <Txt kind="bodyStrong">{copy.today.settlePrompt}</Txt>
          <Button label={copy.today.settleAction} variant="secondary" onPress={() => router.push('/settle')} />
        </Card>
      ) : null}

      {!view.checkInDone ? (
        <Card raised>
          <Txt kind="bodyStrong">{copy.today.checkInPrompt}</Txt>
          <Button label={copy.today.checkInAction} variant="secondary" onPress={() => router.push('/checkin')} />
        </Card>
      ) : null}

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{copy.today.progressLabel}</SectionLabel>
          <SampleTag label={copy.viaTape} />
        </View>
        <Txt kind="number">{view.progressPercent}%</Txt>
        <ProgressBar value={view.progressPercent} height={12} />
        {view.latestRom ? (
          <View style={{ flexDirection: 'row', gap: space.lg }}>
            <View>
              <Txt kind="small" color="textMuted">
                {copy.progress.extension}
              </Txt>
              <Txt kind="bodyStrong">{copy.progress.extensionValue(view.latestRom.extensionDeficitDeg)}</Txt>
            </View>
            <View>
              <Txt kind="small" color="textMuted">
                {copy.progress.flexion}
              </Txt>
              <Txt kind="bodyStrong">{copy.progress.flexionValue(view.latestRom.flexionDeg)}</Txt>
            </View>
          </View>
        ) : null}
      </Card>

      <Card>
        <SectionLabel>{copy.today.todayLabel}</SectionLabel>
        <StatusPill status={view.status.status} large />
        <Txt kind="small" color="textMuted" style={{ marginTop: space.xs }}>
          {copy.today.suggestionLabel}
        </Txt>
        <Txt>{view.suggestion}</Txt>
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/pain')}
        style={({ pressed }) => ({
          backgroundColor: colors.accent,
          borderRadius: radius.lg,
          paddingVertical: space.lg,
          alignItems: 'center',
          gap: space.xs,
          opacity: pressed ? 0.8 : 1,
        })}>
        <Txt kind="heading" color="onAccent">
          {copy.today.painButton}
        </Txt>
        <Txt kind="small" color="onAccent" style={{ opacity: 0.7 }}>
          {copy.today.painButtonHint}
        </Txt>
      </Pressable>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{copy.today.loadLabel}</SectionLabel>
          <Txt kind="small" color="textSecondary">
            {copy.today.loadHint(view.todayLoad.score, view.baselineScore)}
          </Txt>
        </View>
        <Bars
          bars={last7.map((l) => ({
            key: l.date,
            value: l.score,
            label: weekdayLetter(l.date),
            color: l.date === view.date ? statusColor[view.status.status] : 'textMuted',
          }))}
          height={56}
        />
        <Button label={copy.today.logToday} variant="ghost" onPress={() => router.push('/log')} />
      </Card>

      {state.ptReminder ? (
        <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
          {copy.today.ptReminder}
        </Txt>
      ) : null}
    </Screen>
  )
}
