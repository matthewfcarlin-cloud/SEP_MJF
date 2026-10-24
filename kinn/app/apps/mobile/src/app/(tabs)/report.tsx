import { Share, View } from 'react-native'
import { addDays, shareBody, shareText, weekChange, weekHeadline, weeklySummary } from '@kinn/core'
import type { ManualActivity, MorningMark } from '@kinn/core'

import { copy } from '@/copy'
import { shortDate, weekday } from '@/format'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const MORNING_COLOR: Record<MorningMark, ColorToken> = { clear: 'good', some: 'caution', flare: 'warn', none: 'textMuted' }

const signed = (n: number): string => (n > 0 ? `+${n}` : String(n))

function Delta({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <View style={{ flex: 1, minWidth: 120 }}>
      <Txt kind="small" color="textMuted">
        {label}
      </Txt>
      <Txt kind="bodyStrong">{value}</Txt>
    </View>
  )
}

export default function ReportScreen() {
  const { state, today } = useStore()
  const colors = useColors()
  // Last seven full days; today's morning check-in is the "next morning" for yesterday's row.
  const weekEnd = addDays(today, -1)
  const summary = weeklySummary(state.data, weekEnd)
  const change = weekChange(state.data, weekEnd)
  const headline = weekHeadline(summary, change)
  const sessions = (Object.entries(summary.activityCounts) as [ManualActivity, number][]).filter(([a]) => a !== 'rest')
  const maxScore = Math.max(1, ...summary.rows.map((r) => r.load.score))

  const share = async () => {
    try {
      await Share.share({ message: shareText(summary, state.data.profile.name) })
    } catch (error) {
      console.warn('Kinn: share failed.', error)
    }
  }

  const straightening =
    change.extensionDeltaDeg === undefined || change.extensionDeltaDeg === 0
      ? copy.report.noChange
      : change.extensionDeltaDeg < 0
        ? copy.report.straighter(Math.abs(change.extensionDeltaDeg))
        : copy.report.lessStraight(change.extensionDeltaDeg)

  return (
    <Screen title={copy.report.title} subtitle={`${shortDate(summary.weekStart)} to ${shortDate(summary.weekEnd)}`} right={<SampleTag />}>
      <Card raised index={0} style={{ padding: space.lg }}>
        <SectionLabel>{copy.report.headlineTitle}</SectionLabel>
        <Txt kind="title">{headline}</Txt>
      </Card>

      <Card index={1}>
        <SectionLabel>{copy.report.daysTitle}</SectionLabel>
        {summary.rows.map((row) => (
          <View key={row.load.date} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Txt kind="small" color="textSecondary" style={{ width: 34 }}>
              {weekday(row.load.date)}
            </Txt>
            <View style={{ flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(3, (100 * row.load.score) / maxScore)}%`, height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill }} />
            </View>
            <Txt kind="small" style={{ width: 28, textAlign: 'right' }}>
              {row.load.score}
            </Txt>
            <View
              accessibilityLabel={copy.report.morning[row.morning]}
              style={{ width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors[MORNING_COLOR[row.morning]], opacity: row.morning === 'none' ? 0.35 : 1 }}
            />
            <Txt kind="small" color="textMuted" style={{ width: 92 }} numberOfLines={1}>
              {row.activities.length ? row.activities.map((a) => copy.log.activity[a].split(' ')[0]).join(', ') : copy.report.none}
            </Txt>
          </View>
        ))}
        <Txt kind="small" color="textMuted" style={{ marginTop: space.xs }}>
          {copy.report.morningLegend}
        </Txt>
      </Card>

      <Card index={2}>
        <SectionLabel>{copy.report.changeTitle}</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          <Delta label={copy.report.changeLoad} value={`${summary.avgScore} (${signed(change.avgScoreDelta)})`} />
          <Delta
            label={copy.report.changeBend}
            value={summary.peakFlexionDeg !== undefined ? `${summary.peakFlexionDeg}°${change.flexionDeltaDeg !== undefined ? ` (${signed(change.flexionDeltaDeg)}°)` : ''}` : copy.report.none}
          />
          <Delta label={copy.report.changeStraight} value={summary.bestExtensionDeficitDeg !== undefined ? `${copy.progress.extensionValue(summary.bestExtensionDeficitDeg)} · ${straightening}` : copy.report.none} />
          <Delta label={copy.report.changeFlares} value={`${summary.flares.length} (${signed(change.flareDelta)})`} />
        </View>
      </Card>

      <Card index={3}>
        <SectionLabel>{copy.report.sessionsTitle}</SectionLabel>
        {sessions.length === 0 ? (
          <Txt color="textMuted">{copy.report.none}</Txt>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {sessions.map(([a, n]) => (
              <View key={a} style={{ alignItems: 'center', minWidth: 64 }}>
                <Txt kind="heading">{n}</Txt>
                <Txt kind="small" color="textMuted">
                  {copy.log.activity[a].split(' ')[0]}
                </Txt>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card index={4}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{copy.report.previewTitle}</SectionLabel>
          <SampleTag label={copy.viaTape} />
        </View>
        <Txt kind="small" color="textSecondary" style={{ fontFamily: undefined, lineHeight: 20 }}>
          {shareBody(summary, state.data.profile.name)}
        </Txt>
        <Txt kind="small" color="textMuted">
          {copy.report.previewNote}
        </Txt>
      </Card>

      <Button label={copy.report.share} onPress={share} />
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {copy.disclaimerShort}
      </Txt>
    </Screen>
  )
}
