import { View } from 'react-native'
import { addDays } from '@kinn/core'

import { copy } from '@/copy'
import { shortDate } from '@/format'
import { useStore } from '@/store/provider'
import { Card } from '@/components/ui/card'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { space } from '@/theme/tokens'

export default function InsightsScreen() {
  const { view, state } = useStore()
  const dayBefore = (date: string): string => {
    const prev = addDays(date, -1)
    const logs = state.data.activityLogs.filter((l) => l.date === prev)
    return logs.length ? logs.map((l) => copy.log.activity[l.activity]).join(', ') : copy.report.none
  }

  return (
    <Screen title={copy.insights.title} subtitle={copy.insights.subtitle} right={<SampleTag />}>
      <Txt kind="small" color="textSecondary">
        {copy.insights.flareCount(view.flares.length)}
      </Txt>

      {view.insights.length === 0 ? (
        <Card>
          <Txt color="textSecondary">{copy.insights.empty}</Txt>
        </Card>
      ) : (
        view.insights.map((i, idx) => (
          <Card key={i.id} raised={idx === 0} style={idx === 0 ? { padding: space.lg } : undefined}>
            <Txt kind={idx === 0 ? 'title' : 'heading'}>{i.text}</Txt>
            <Txt kind="small" color="textMuted">
              {copy.insights.prevalenceNote(Math.round(i.prevalence * 100))}
            </Txt>
          </Card>
        ))
      )}

      {view.loadContrast ? (
        <Card>
          <SectionLabel>{copy.insights.loadContrastTitle}</SectionLabel>
          <Txt kind="heading">{view.loadContrast.text}</Txt>
          <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.xs }}>
            <View>
              <Txt kind="number" style={{ fontSize: 40, lineHeight: 44 }}>
                {view.loadContrast.beforeFlareAvg}
              </Txt>
              <Txt kind="small" color="textMuted">
                {copy.insights.beforeFlare}
              </Txt>
            </View>
            <View>
              <Txt kind="number" color="textSecondary" style={{ fontSize: 40, lineHeight: 44 }}>
                {view.loadContrast.otherDaysAvg}
              </Txt>
              <Txt kind="small" color="textMuted">
                {copy.insights.beforeOthers}
              </Txt>
            </View>
          </View>
        </Card>
      ) : null}

      <Txt kind="small" color="textMuted">
        {copy.insights.observationNote}
      </Txt>

      {view.flares.length > 0 ? (
        <Card>
          <SectionLabel>{copy.insights.flareListTitle}</SectionLabel>
          {[...view.flares].reverse().map((f) => (
            <View key={f.date} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
              <Txt kind="bodyStrong">{shortDate(f.date)}</Txt>
              <Txt color="textSecondary" style={{ flex: 1, textAlign: 'right' }}>
                day before: {dayBefore(f.date)}
              </Txt>
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  )
}
