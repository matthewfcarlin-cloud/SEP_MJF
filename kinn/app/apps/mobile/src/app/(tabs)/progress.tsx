import { View } from 'react-native'

import { copy } from '@/copy'
import { shortDate } from '@/format'
import { useStore } from '@/store/provider'
import { LineChart } from '@/components/line-chart'
import { Bars } from '@/components/ui/bars'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { space } from '@/theme/tokens'

export default function ProgressScreen() {
  const { view, state } = useStore()
  const rom = [...state.data.romDays].sort((a, b) => a.date.localeCompare(b.date))
  const indexOf = (date: string): number => rom.findIndex((d) => d.date === date)
  const flexMarkers = view.milestones
    .filter((m) => m.kind !== 'full-straightening')
    .map((m) => ({ index: indexOf(m.date), label: `${m.label} · ${shortDate(m.date)}` }))
    .filter((m) => m.index >= 0)
  const extMarkers = view.milestones
    .filter((m) => m.kind === 'full-straightening')
    .map((m) => ({ index: indexOf(m.date), label: `${m.label} · ${shortDate(m.date)}` }))
    .filter((m) => m.index >= 0)
  const last21 = view.loads.slice(-21)

  return (
    <Screen title={copy.progress.title} subtitle={copy.progress.subtitle} right={<SampleTag label={copy.viaTape} />}>
      <Card>
        <SectionLabel>{copy.today.progressLabel}</SectionLabel>
        <Txt kind="number">{view.progressPercent}%</Txt>
        <ProgressBar value={view.progressPercent} height={12} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SectionLabel>{copy.progress.flexion}</SectionLabel>
          {view.latestRom ? <Txt kind="bodyStrong">{copy.progress.flexionValue(view.latestRom.flexionDeg)}</Txt> : null}
        </View>
        <LineChart values={rom.map((d) => d.flexionDeg)} min={90} max={135} unit="°" markers={flexMarkers} reference={120} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SectionLabel>{copy.progress.extension}</SectionLabel>
          {view.latestRom ? <Txt kind="bodyStrong">{copy.progress.extensionValue(view.latestRom.extensionDeficitDeg)}</Txt> : null}
        </View>
        <LineChart values={rom.map((d) => d.extensionDeficitDeg)} min={0} max={10} unit="° short" color="good" markers={extMarkers} reference={2} />
      </Card>

      {view.milestones.length > 0 ? (
        <Card>
          <SectionLabel>{copy.progress.milestones}</SectionLabel>
          {view.milestones.map((m) => (
            <View key={m.kind} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
              <Txt kind="bodyStrong">{m.label}</Txt>
              <Txt color="textSecondary">{shortDate(m.date)}</Txt>
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <SectionLabel>{copy.progress.loadTitle}</SectionLabel>
        <Bars bars={last21.map((l) => ({ key: l.date, value: l.score, color: 'textMuted' as const }))} height={64} />
        <View style={{ flexDirection: 'row' }}>
          {[2, 1, 0].map((n) => (
            <Txt key={n} kind="small" color="textMuted" style={{ flex: 1, textAlign: 'center' }}>
              {copy.progress.weekAgo(n)}
            </Txt>
          ))}
        </View>
      </Card>
    </Screen>
  )
}
