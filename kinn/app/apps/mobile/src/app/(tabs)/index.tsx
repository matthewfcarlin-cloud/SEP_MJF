import { Link, router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { addDays } from '@reco/core'

import { copy } from '@/copy'
import { weekdayLetter } from '@/format'
import { useStore } from '@/store/provider'
import { Dial } from '@/components/dial'
import { TapeLiveCard } from '@/components/tape/live-card'
import { Bars } from '@/components/ui/bars'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

/** The morning asks, shown above the dial until answered so the first tap of the day is the right one. */
function MorningAsks({ pendingSettle, checkInDone }: { readonly pendingSettle: boolean; readonly checkInDone: boolean }) {
  if (!pendingSettle && checkInDone) return null
  const both = pendingSettle && !checkInDone
  return (
    <Card raised index={0} style={{ gap: space.sm }}>
      <SectionLabel>{copy.today.morningFirst}</SectionLabel>
      <Txt kind="bodyStrong">{both ? copy.today.bothAsks : pendingSettle ? copy.today.settlePrompt : copy.today.checkInPrompt}</Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {pendingSettle ? <Button label={copy.today.settleShort} variant="secondary" onPress={() => router.push('/settle')} style={{ flex: 1 }} /> : null}
        {!checkInDone ? <Button label={both ? copy.today.checkInShort : copy.today.checkInAction} variant="secondary" onPress={() => router.push('/checkin')} style={{ flex: 1 }} /> : null}
      </View>
    </Card>
  )
}

const openTape = () => router.push('/tape')

export default function TodayScreen() {
  const { view, state } = useStore()
  const colors = useColors()
  const { profile } = state.data
  const [hour] = useState(() => new Date().getHours())
  const last7 = view.loads.slice(-7)
  const yesterday = addDays(view.date, -1)
  const yesterdayActivities = state.data.activityLogs
    .filter((l) => l.date === yesterday)
    .map((l) => copy.log.activity[l.activity].split(' ')[0])
    .join(', ')

  return (
    <Screen
      title={copy.today.timeGreeting(hour, profile.name)}
      subtitle={`${copy.today.weekLabel(view.weeksSinceInjury)} · ${copy.today.goalLabel(profile.goal)}`}
      right={<SettingsLink />}>
      <MorningAsks pendingSettle={view.pendingSettle.length > 0} checkInDone={view.checkInDone} />

      <View style={{ alignItems: 'center', gap: space.sm }}>
        <Dial value={view.progressPercent} color={statusColor[view.status.status]} size={264}>
          <Txt kind="number" style={{ fontSize: 56, lineHeight: 60 }}>
            {view.progressPercent}%
          </Txt>
          <Txt kind="label" color="textMuted">
            {copy.today.dialLabel}
          </Txt>
        </Dial>
        <View style={{ marginTop: -space.lg }}>
          <StatusPill status={view.status.status} large align="center" />
        </View>
        <Txt style={{ textAlign: 'center', paddingHorizontal: space.md }}>{view.suggestion}</Txt>
        {view.latestRom ? (
          <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'center', marginTop: space.xs }}>
            <View style={{ alignItems: 'center' }}>
              <Txt kind="bodyStrong">{copy.progress.extensionValue(view.latestRom.extensionDeficitDeg)}</Txt>
              <Txt kind="small" color="textMuted">
                {copy.progress.extension}
              </Txt>
            </View>
            <SampleTag label={copy.viaTape} onPress={openTape} />
            <View style={{ alignItems: 'center' }}>
              <Txt kind="bodyStrong">{copy.progress.flexionValue(view.latestRom.flexionDeg)}</Txt>
              <Txt kind="small" color="textMuted">
                {copy.progress.flexion}
              </Txt>
            </View>
          </View>
        ) : null}
      </View>

      <TapeLiveCard index={0} />

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

      <Card index={1}>
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
        <Txt kind="small" color="textMuted">
          {copy.today.yesterdayLine(yesterdayActivities, view.yesterdayLoad.score)}
        </Txt>
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
