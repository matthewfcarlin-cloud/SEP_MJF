import { Link, router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { addDays } from '@reco/core'

import { copy } from '@/copy'
import { weekdayLetter } from '@/format'
import { useStore } from '@/store/provider'
import { Dial } from '@/components/dial'
import { TapeLiveCard } from '@/components/tape/live-card'
import { Bars } from '@/components/ui/bars'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
        <View style={{ width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name="gearshape" size={18} tintColor={colors.textSecondary} />
        </View>
      </Pressable>
    </Link>
  )
}

const DIAL_SIZE = 256
const DIAL_ZONE = 276

/** A section label with the teal live dot: things the tape or the morning ask feed. */
function LiveLabel({ children }: { readonly children: string }) {
  const colors = useColors()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.live }} />
      <SectionLabel>{children}</SectionLabel>
    </View>
  )
}

/** Three soft hills behind the dial: the quiet horizon from the ceramic screens. Decorative. */
function Horizon() {
  const colors = useColors()
  return (
    <Svg width="100%" height={96} viewBox="0 0 390 96" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      <Path d="M0 52 C60 30 120 40 180 50 C250 62 310 28 390 40 L390 96 L0 96 Z" fill={colors.horizon} opacity={0.45} />
      <Path d="M0 70 C80 52 150 60 210 68 C280 78 330 56 390 62 L390 96 L0 96 Z" fill={colors.horizon} opacity={0.75} />
      <Path d="M0 84 C90 74 170 82 240 86 C300 89 350 80 390 82 L390 96 L0 96 Z" fill={colors.horizon} />
    </Svg>
  )
}

/** The morning asks, shown above the dial until answered so the first tap of the day is the right one. */
function MorningAsks({ pendingSettle, checkInDone }: { readonly pendingSettle: boolean; readonly checkInDone: boolean }) {
  if (!pendingSettle && checkInDone) return null
  const both = pendingSettle && !checkInDone
  return (
    <Card index={0} style={{ gap: space.sm }}>
      <LiveLabel>{copy.today.morningFirst}</LiveLabel>
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

      <Card index={1} style={{ gap: space.md, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{copy.today.callLabel}</SectionLabel>
          {view.latestRom ? (
            <Pressable accessibilityRole="button" onPress={openTape} hitSlop={12}>
              <LiveLabel>{copy.viaTape}</LiveLabel>
            </Pressable>
          ) : null}
        </View>
        <View style={{ height: DIAL_ZONE, marginHorizontal: -space.md, alignItems: 'center', justifyContent: 'center' }}>
          <Horizon />
          <Dial value={view.progressPercent} color={statusColor[view.status.status]} size={DIAL_SIZE}>
            <Txt kind="number" style={{ fontSize: 52, lineHeight: 56 }}>
              {view.progressPercent}%
            </Txt>
            <Txt kind="label" color="textMuted">
              {copy.today.dialLabel}
            </Txt>
          </Dial>
        </View>
        <View style={{ alignItems: 'center', gap: space.sm }}>
          <StatusPill status={view.status.status} large align="center" />
          <Txt color="textSecondary" style={{ textAlign: 'center', paddingHorizontal: space.sm }}>
            {view.suggestion}
          </Txt>
        </View>
        {view.latestRom ? (
          <View style={{ flexDirection: 'row', gap: space.sm, backgroundColor: colors.surfaceRaised, borderRadius: radius.md + 2, paddingVertical: 14, paddingHorizontal: space.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt kind="bodyStrong">{copy.progress.extensionValue(view.latestRom.extensionDeficitDeg)}</Txt>
              <Txt kind="small" color="textSecondary">
                {copy.progress.extension}
              </Txt>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt kind="bodyStrong">{copy.progress.flexionValue(view.latestRom.flexionDeg)}</Txt>
              <Txt kind="small" color="textSecondary">
                {copy.progress.flexion}
              </Txt>
            </View>
          </View>
        ) : null}
      </Card>

      <TapeLiveCard index={2} />

      <View style={{ gap: space.sm }}>
        <Pressable
          accessibilityRole="button"
          accessibilityHint={copy.today.painButtonHint}
          onPress={() => router.push('/pain')}
          style={({ pressed }) => ({
            backgroundColor: colors.accent,
            borderRadius: radius.pill,
            paddingVertical: space.md,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}>
          <Txt kind="bodyStrong" color="onAccent" style={{ fontSize: 17 }}>
            {copy.today.painButton}
          </Txt>
        </Pressable>
        <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
          {copy.today.painButtonHint}
        </Txt>
      </View>

      <Card index={3}>
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
