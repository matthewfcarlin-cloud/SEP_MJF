import { Share, View } from 'react-native'
import { shareText, weeklySummary } from '@kinn/core'
import type { ManualActivity } from '@kinn/core'

import { copy } from '@/copy'
import { shortDate, weekdayLetter } from '@/format'
import { useStore } from '@/store/provider'
import { Bars } from '@/components/ui/bars'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { space } from '@/theme/tokens'

export default function ReportScreen() {
  const { state, today } = useStore()
  const summary = weeklySummary(state.data, today)
  const sessions = (Object.entries(summary.activityCounts) as [ManualActivity, number][]).filter(([a]) => a !== 'rest')

  const share = async () => {
    try {
      await Share.share({ message: shareText(summary, state.data.profile.name) })
    } catch (error) {
      console.warn('Kinn: share failed.', error)
    }
  }

  return (
    <Screen title={copy.report.title} subtitle={`${shortDate(summary.weekStart)} to ${shortDate(summary.weekEnd)}`} right={<SampleTag />}>
      <Card>
        <SectionLabel>{copy.report.loadTitle}</SectionLabel>
        <Bars bars={summary.days.map((d) => ({ key: d.date, value: d.score, label: weekdayLetter(d.date) }))} />
      </Card>
      <Card>
        <SectionLabel>{copy.report.flaresTitle}</SectionLabel>
        {summary.flares.length === 0 ? (
          <Txt color="textMuted">{copy.report.none}</Txt>
        ) : (
          summary.flares.map((f) => <Txt key={f.date}>{shortDate(f.date)}</Txt>)
        )}
      </Card>
      <Card>
        <SectionLabel>{copy.report.sessionsTitle}</SectionLabel>
        {sessions.length === 0 ? (
          <Txt color="textMuted">{copy.report.none}</Txt>
        ) : (
          sessions.map(([a, n]) => (
            <View key={a} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt>{copy.log.activity[a]}</Txt>
              <Txt color="textSecondary">{n}</Txt>
            </View>
          ))
        )}
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SectionLabel>{copy.report.rangeTitle}</SectionLabel>
          <SampleTag label={copy.viaTape} />
        </View>
        <View style={{ flexDirection: 'row', gap: space.lg }}>
          <View>
            <Txt kind="small" color="textMuted">
              {copy.progress.extension}
            </Txt>
            <Txt kind="bodyStrong">{summary.bestExtensionDeficitDeg !== undefined ? copy.progress.extensionValue(summary.bestExtensionDeficitDeg) : copy.report.none}</Txt>
          </View>
          <View>
            <Txt kind="small" color="textMuted">
              {copy.progress.flexion}
            </Txt>
            <Txt kind="bodyStrong">{summary.peakFlexionDeg !== undefined ? copy.progress.flexionValue(summary.peakFlexionDeg) : copy.report.none}</Txt>
          </View>
        </View>
      </Card>
      <Button label={copy.report.share} onPress={share} />
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {copy.disclaimerShort}
      </Txt>
    </Screen>
  )
}
