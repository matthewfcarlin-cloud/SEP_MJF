import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { MANUAL_UNITS, addDays, scoreFromUnits } from '@kinn/core'
import type { Intensity, ManualActivity } from '@kinn/core'

import { copy } from '@/copy'
import { weekday } from '@/format'
import { successFeedback, tapFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const ACTIVITIES: readonly ManualActivity[] = ['practice', 'game', 'gym', 'pt', 'walking', 'rest']
const INTENSITIES: readonly Intensity[] = ['light', 'moderate', 'hard']
const RECENT_DAYS = 7

/** Today's load against the athlete's usual, with a tick at the usual value. */
function LoadVersusUsual({ score, usual, max }: { readonly score: number; readonly usual: number; readonly max: number }) {
  const colors = useColors()
  const pct = (v: number): number => Math.max(0, Math.min(100, (100 * v) / max))
  return (
    <View style={{ gap: space.xs }}>
      <View style={{ height: 14, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
        <View style={{ width: `${pct(score)}%`, height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill }} />
        {usual > 0 ? <View style={{ position: 'absolute', left: `${pct(usual)}%`, top: 0, bottom: 0, width: 2, backgroundColor: colors.textSecondary }} /> : null}
      </View>
      {usual > 0 ? (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: `${pct(usual)}%` }} />
          <Txt kind="label" color="textMuted" style={{ marginLeft: -12 }}>
            {copy.log.usualMarker} {Math.round(usual)}
          </Txt>
        </View>
      ) : null}
    </View>
  )
}

export default function LogScreen() {
  const { state, today, addActivity, removeActivity, view } = useStore()
  const colors = useColors()
  const [activity, setActivity] = useState<ManualActivity | undefined>(undefined)
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const [justSaved, setJustSaved] = useState(false)

  const todays = state.data.activityLogs.filter((l) => l.date === today)
  const previewUnits = activity ? MANUAL_UNITS[activity][intensity] : 0
  const previewScore = scoreFromUnits(view.todayLoad.units + previewUnits)
  const barMax = Math.max(100, previewScore, view.baselineScore * 1.5)

  const recent = Array.from({ length: RECENT_DAYS }, (_, i) => addDays(today, -(RECENT_DAYS - i)))
    .map((date) => ({
      date,
      load: view.loads.find((l) => l.date === date),
      activities: state.data.activityLogs.filter((l) => l.date === date),
    }))

  const save = () => {
    if (!activity) return
    addActivity(activity, intensity)
    successFeedback()
    setActivity(undefined)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1200)
  }

  return (
    <Screen title={copy.log.title} right={<SampleTag label={copy.log.autoTag} />}>
      <Card index={0}>
        <SectionLabel>{copy.log.activityTitle}</SectionLabel>
        <ChipRow>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={copy.log.activity[a]} selected={activity === a} onPress={() => setActivity(activity === a ? undefined : a)} />
          ))}
        </ChipRow>
        <SectionLabel>{copy.log.intensityTitle}</SectionLabel>
        <ChipRow>
          {INTENSITIES.map((i) => (
            <Chip key={i} label={copy.log.intensity[i]} selected={intensity === i} onPress={() => setIntensity(i)} />
          ))}
        </ChipRow>
        <Txt kind="small" color={activity ? 'textSecondary' : 'textMuted'} style={{ marginTop: space.xs }}>
          {activity ? copy.log.preview(previewScore - view.todayLoad.score, previewScore) : copy.log.previewHint}
        </Txt>
        <Button label={justSaved ? copy.log.saved : copy.log.save} disabled={!activity} onPress={save} />
      </Card>

      <Card index={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <SectionLabel>{copy.log.todaySoFar}</SectionLabel>
          <Txt kind="heading">{view.todayLoad.score}</Txt>
        </View>
        <LoadVersusUsual score={view.todayLoad.score} usual={view.baselineScore} max={barMax} />
        {todays.length === 0 ? (
          <Txt color="textMuted" style={{ marginTop: space.xs }}>
            {copy.log.nothingYet}
          </Txt>
        ) : (
          <View style={{ gap: space.xs, marginTop: space.xs }}>
            {todays.map((l) => (
              <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Txt>
                  {copy.log.activity[l.activity]} · {copy.log.intensity[l.intensity]}
                </Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Txt kind="small" color="textMuted">
                    +{scoreFromUnits(MANUAL_UNITS[l.activity][l.intensity])}
                  </Txt>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.log.remove}
                    hitSlop={10}
                    onPress={() => {
                      tapFeedback()
                      removeActivity(l.id)
                    }}
                    style={({ pressed }) => ({
                      width: 26,
                      height: 26,
                      borderRadius: radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.surfaceRaised,
                      opacity: pressed ? 0.6 : 1,
                    })}>
                    <Txt kind="small" color="textSecondary">
                      ×
                    </Txt>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card index={2}>
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
            <Txt kind="small" color="textMuted" style={{ width: 110 }} numberOfLines={1}>
              {r.activities.length ? r.activities.map((l) => `${copy.log.activity[l.activity].split(' ')[0]}`).join(', ') : copy.report.none}
            </Txt>
          </View>
        ))}
        <Txt kind="small" color="textMuted" style={{ marginTop: space.xs }}>
          {copy.log.autoBody}
        </Txt>
      </Card>
    </Screen>
  )
}
