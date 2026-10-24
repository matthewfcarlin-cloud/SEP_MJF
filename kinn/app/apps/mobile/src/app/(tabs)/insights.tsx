import { View } from 'react-native'
import { addDays } from '@kinn/core'
import type { ManualActivity, TimelineDay } from '@kinn/core'

import { copy } from '@/copy'
import { shortDate, weekdayLetter } from '@/format'
import { useStore } from '@/store/provider'
import { Card } from '@/components/ui/card'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const ACTIVITY_WORD: Record<ManualActivity, string> = { game: 'Game', practice: 'Practice', gym: 'Gym', pt: 'PT', walking: 'Walking', rest: 'Rest' }

/** 30 small bars, one per day; flare mornings and the day before are coloured, the top insight's days get a dot. */
function Timeline({ days, matchedLabel }: { readonly days: readonly TimelineDay[]; readonly matchedLabel: string | undefined }) {
  const colors = useColors()
  const barColor = (d: TimelineDay): string =>
    d.mark === 'flare' ? colors.warn : d.mark === 'before-flare' ? colors.caution : d.score > 0 ? colors.textMuted : colors.track
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 56 }}>
        {days.map((d) => (
          <View key={d.date} style={{ flex: 1, alignItems: 'center', gap: 3, justifyContent: 'flex-end', height: '100%' }}>
            <View style={{ width: '100%', height: `${Math.max(6, d.score)}%`, borderRadius: 2, backgroundColor: barColor(d), opacity: d.mark === 'none' ? 0.6 : 1 }} />
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: d.mark === 'matched' || (d.mark === 'before-flare' && matchedLabel) ? colors.text : 'transparent' }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt kind="small" color="textMuted">
          {shortDate(days[0]?.date ?? '')}
        </Txt>
        <Txt kind="small" color="textMuted">
          {copy.today.todayLabel}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        <Legend color={colors.warn} label={copy.insights.legendFlare} />
        <Legend color={colors.caution} label={copy.insights.legendBefore} />
        {matchedLabel ? <Legend color={colors.text} label={copy.insights.legendMatched(matchedLabel)} dot /> : null}
      </View>
    </View>
  )
}

function Legend({ color, label, dot = false }: { readonly color: string; readonly label: string; readonly dot?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: dot ? 5 : 10, height: dot ? 5 : 10, borderRadius: dot ? 3 : 3, backgroundColor: color }} />
      <Txt kind="small" color="textSecondary">
        {label}
      </Txt>
    </View>
  )
}

function ContrastBar({ value, max, label, strong }: { readonly value: number; readonly max: number; readonly label: string; readonly strong: boolean }) {
  const colors = useColors()
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt kind="small" color="textSecondary">
          {label}
        </Txt>
        <Txt kind="bodyStrong" color={strong ? 'text' : 'textSecondary'}>
          {value}
        </Txt>
      </View>
      <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(2, (100 * value) / max)}%`, height: '100%', backgroundColor: strong ? colors.warn : colors.textMuted, borderRadius: radius.pill }} />
      </View>
    </View>
  )
}

const CONDITION_WORD: Readonly<Record<string, string>> = { 'after-game': 'Game', 'after-practice': 'Practice', 'after-gym': 'Gym', 'after-pt': 'PT' }

export default function InsightsScreen() {
  const { view, state } = useStore()
  const colors = useColors()
  const top = view.insights[0]
  const matchedLabel = top ? CONDITION_WORD[top.id] : undefined
  const dayBeforeLoad = (date: string) => view.loads.find((l) => l.date === addDays(date, -1))
  const dayBeforeActivities = (date: string): readonly ManualActivity[] =>
    state.data.activityLogs.filter((l) => l.date === addDays(date, -1)).map((l) => l.activity)
  const maxLoad = Math.max(1, ...view.loads.map((l) => l.score))

  return (
    <Screen title={copy.insights.title} subtitle={copy.insights.subtitle} right={<SampleTag />}>
      {top ? (
        <Card raised index={0} style={{ padding: space.lg, gap: space.md }}>
          <Txt kind="title">{top.text}</Txt>
          <Timeline days={view.timeline} matchedLabel={matchedLabel} />
          <Txt kind="small" color="textMuted">
            {copy.insights.prevalenceNote(Math.round(top.prevalence * 100))}
          </Txt>
        </Card>
      ) : (
        <Card index={0}>
          <Txt color="textSecondary">{copy.insights.empty}</Txt>
        </Card>
      )}

      {view.insights.slice(1).map((i, idx) => (
        <Card key={i.id} index={idx + 1}>
          <Txt kind="heading">{i.text}</Txt>
          <Txt kind="small" color="textMuted">
            {copy.insights.prevalenceNote(Math.round(i.prevalence * 100))}
          </Txt>
        </Card>
      ))}

      {view.loadContrast ? (
        <Card index={2}>
          <SectionLabel>{copy.insights.loadContrastTitle}</SectionLabel>
          <ContrastBar value={view.loadContrast.beforeFlareAvg} max={100} label={copy.insights.beforeFlare} strong />
          <ContrastBar value={view.loadContrast.otherDaysAvg} max={100} label={copy.insights.beforeOthers} strong={false} />
        </Card>
      ) : null}

      <Txt kind="small" color="textMuted">
        {copy.insights.observationNote}
      </Txt>

      {view.flares.length > 0 ? (
        <Card index={3}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SectionLabel>{copy.insights.flareListTitle}</SectionLabel>
            <Txt kind="small" color="textMuted">
              {copy.insights.flareCount(view.flares.length)}
            </Txt>
          </View>
          {[...view.flares].reverse().map((f) => {
            const load = dayBeforeLoad(f.date)
            const acts = dayBeforeActivities(f.date)
            return (
              <View key={f.date} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <View style={{ width: 54 }}>
                  <Txt kind="bodyStrong">{shortDate(f.date)}</Txt>
                  <Txt kind="small" color="textMuted">
                    {weekdayLetter(f.date)}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt kind="small" color="textMuted">
                    {copy.insights.dayBefore}
                  </Txt>
                  <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.max(2, (100 * (load?.score ?? 0)) / maxLoad)}%`, height: '100%', backgroundColor: colors.caution, borderRadius: radius.pill }} />
                  </View>
                </View>
                <Txt kind="small" style={{ width: 24, textAlign: 'right' }}>
                  {load?.score ?? 0}
                </Txt>
                <View style={{ width: 70, alignItems: 'flex-end' }}>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border }}>
                    <Txt kind="small">{acts.length ? ACTIVITY_WORD[acts[0]!] : copy.report.none}</Txt>
                  </View>
                </View>
              </View>
            )
          })}
        </Card>
      ) : null}
    </Screen>
  )
}
