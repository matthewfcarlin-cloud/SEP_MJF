import { router } from 'expo-router'
import { Pressable, View } from 'react-native'
import { MANUAL_UNITS, addDays, scoreFromUnits } from '@reco/core'

import { copy } from '@/copy'
import { weekday } from '@/format'
import { tapFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const RECENT_DAYS = 7
const BAR_HEADROOM = 1.5

/** Today's load against the athlete's usual, with a tick at the usual value. */
function LoadVersusUsual({ score, usual }: { readonly score: number; readonly usual: number }) {
  const colors = useColors()
  const max = Math.max(100, score, usual * BAR_HEADROOM)
  const pct = (v: number): number => Math.max(0, Math.min(100, (100 * v) / max))
  return (
    <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
      <View style={{ width: `${pct(score)}%`, height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill }} />
      {usual > 0 ? <View style={{ position: 'absolute', left: `${pct(usual)}%`, top: 0, bottom: 0, width: 2, backgroundColor: colors.textSecondary }} /> : null}
    </View>
  )
}

function RemoveButton({ onPress }: { readonly onPress: () => void }) {
  const colors = useColors()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copy.log.remove}
      hitSlop={10}
      onPress={() => {
        tapFeedback()
        onPress()
      }}
      style={({ pressed }) => ({ width: 26, height: 26, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.6 : 1 })}>
      <Txt kind="small" color="textSecondary">
        ×
      </Txt>
    </Pressable>
  )
}

/** Today's load and what made it, one button to add more, and the week behind it. */
export default function LogScreen() {
  const { state, today, removeActivity, view } = useStore()
  const colors = useColors()
  const usual = Math.round(view.baselineScore)
  const todays = state.data.activityLogs.filter((l) => l.date === today)
  const recent = Array.from({ length: RECENT_DAYS }, (_, i) => addDays(today, -(RECENT_DAYS - i))).map((date) => ({
    date,
    load: view.loads.find((l) => l.date === date),
    activities: state.data.activityLogs.filter((l) => l.date === date),
  }))

  return (
    <Screen title={copy.simple.logTitle}>
      <Card index={0} style={{ gap: space.md, padding: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Txt kind="small" color="textSecondary">
              {copy.today.loadTodayLabel}
            </Txt>
            <Txt kind="number" style={{ fontSize: 44, lineHeight: 48 }}>
              {view.todayLoad.score}
            </Txt>
          </View>
          {usual > 0 ? (
            <Txt kind="small" color="textSecondary">
              {copy.today.yourUsual(usual)}
            </Txt>
          ) : null}
        </View>
        <LoadVersusUsual score={view.todayLoad.score} usual={usual} />
        {todays.length === 0 ? (
          <Txt color="textMuted">{copy.simple.nothingYet}</Txt>
        ) : (
          <View style={{ gap: space.sm }}>
            {todays.map((l) => (
              <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Txt>
                  {copy.log.activity[l.activity]} · {copy.log.intensity[l.intensity]}
                </Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Txt kind="small" color="textMuted">
                    +{scoreFromUnits(MANUAL_UNITS[l.activity][l.intensity])}
                  </Txt>
                  <RemoveButton onPress={() => removeActivity(l.id)} />
                </View>
              </View>
            ))}
          </View>
        )}
        <Button label={copy.simple.add} onPress={() => router.push('/add')} />
      </Card>

      <Card index={1}>
        <SectionLabel>{copy.log.recentTitle}</SectionLabel>
        {recent.map((r) => (
          <View key={r.date} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Txt kind="small" color="textSecondary" style={{ width: 34 }}>
              {weekday(r.date)}
            </Txt>
            <View style={{ flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(2, r.load?.score ?? 0)}%`, height: '100%', backgroundColor: colors.textMuted, borderRadius: radius.pill }} />
            </View>
            <Txt kind="small" style={{ width: 28, textAlign: 'right' }}>
              {r.load?.score ?? 0}
            </Txt>
          </View>
        ))}
      </Card>
    </Screen>
  )
}
