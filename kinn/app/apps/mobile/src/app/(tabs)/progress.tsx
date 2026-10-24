import { View } from 'react-native'
import { ROM_TARGETS } from '@kinn/core'
import type { RomDay } from '@kinn/core'

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
import { useColors } from '@/theme/use-tokens'

function Stat({ label, value, sub }: { readonly label: string; readonly value: string; readonly sub?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Txt kind="small" color="textMuted">
        {label}
      </Txt>
      <Txt kind="heading">{value}</Txt>
      {sub ? (
        <Txt kind="small" color="textSecondary">
          {sub}
        </Txt>
      ) : null}
    </View>
  )
}

export default function ProgressScreen() {
  const { view, state } = useStore()
  const colors = useColors()
  const rom = [...state.data.romDays].sort((a, b) => a.date.localeCompare(b.date))
  const first = rom[0]
  const latest = rom.at(-1)
  const weekAgo = rom.at(-8)
  const indexOf = (date: string): number => rom.findIndex((d) => d.date === date)
  const marker = (kinds: readonly string[]) =>
    view.milestones
      .filter((m) => kinds.includes(m.kind))
      .map((m) => ({ index: indexOf(m.date), label: `${m.label} · ${shortDate(m.date)}` }))
      .filter((m) => m.index >= 0)
  const xLabels = first && latest ? ([shortDate(first.date), shortDate(rom[Math.floor(rom.length / 2)]?.date ?? first.date), shortDate(latest.date)] as const) : undefined
  const last21 = view.loads.slice(-21)

  const bendGain = (from: RomDay | undefined, to: RomDay | undefined): string =>
    from && to ? (to.flexionDeg > from.flexionDeg ? copy.progress.gainedBend(to.flexionDeg - from.flexionDeg) : copy.progress.noGain) : copy.report.none
  const straightGain = (from: RomDay | undefined, to: RomDay | undefined): string =>
    from && to
      ? from.extensionDeficitDeg - to.extensionDeficitDeg >= 1
        ? copy.progress.gainedStraight(Math.round(from.extensionDeficitDeg - to.extensionDeficitDeg))
        : copy.progress.noGain
      : copy.report.none

  const reached = new Set(view.milestones.map((m) => m.kind))
  const nextUp = !latest
    ? undefined
    : !reached.has('bike-range')
      ? copy.progress.nextBike(Math.max(0, ROM_TARGETS.bikeFlexionDeg - latest.flexionDeg))
      : !reached.has('full-bend')
        ? copy.progress.nextFullBend(Math.max(0, ROM_TARGETS.fullFlexionDeg - latest.flexionDeg))
        : copy.progress.allReached

  return (
    <Screen title={copy.progress.title} subtitle={copy.progress.subtitle} right={<SampleTag label={copy.viaTape} />}>
      <Card index={0}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <SectionLabel>{copy.today.progressLabel}</SectionLabel>
          <Txt kind="heading">{view.progressPercent}%</Txt>
        </View>
        <ProgressBar value={view.progressPercent} height={12} />
        {nextUp ? (
          <View style={{ marginTop: space.xs }}>
            <Txt kind="small" color="textMuted">
              {copy.progress.nextMilestone}
            </Txt>
            <Txt kind="bodyStrong">{nextUp}</Txt>
          </View>
        ) : null}
      </Card>

      <Card index={1} raised>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <SectionLabel>{copy.progress.flexion}</SectionLabel>
          {latest ? <Txt kind="title">{copy.progress.flexionValue(latest.flexionDeg)}</Txt> : null}
        </View>
        <LineChart
          values={rom.map((d) => d.flexionDeg)}
          min={90}
          max={135}
          unit="°"
          area
          markers={marker(['bike-range', 'full-bend'])}
          reference={ROM_TARGETS.bikeFlexionDeg}
          referenceLabel={copy.progress.bikeLine}
          xLabels={xLabels}
        />
        <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xs }}>
          <Stat label={copy.progress.sinceStart} value={bendGain(first, latest)} />
          <Stat label={copy.progress.thisWeek} value={bendGain(weekAgo, latest)} />
        </View>
      </Card>

      <Card index={2}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <SectionLabel>{copy.progress.extension}</SectionLabel>
          {latest ? <Txt kind="title">{copy.progress.extensionValue(latest.extensionDeficitDeg)}</Txt> : null}
        </View>
        <LineChart
          values={rom.map((d) => d.extensionDeficitDeg)}
          min={0}
          max={10}
          unit="° short"
          color="good"
          area
          markers={marker(['full-straightening'])}
          reference={ROM_TARGETS.straightDeg}
          referenceLabel={copy.progress.straightLine}
          xLabels={xLabels}
        />
        <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xs }}>
          <Stat label={copy.progress.sinceStart} value={straightGain(first, latest)} />
          <Stat label={copy.progress.thisWeek} value={straightGain(weekAgo, latest)} />
        </View>
      </Card>

      {view.milestones.length > 0 ? (
        <Card index={3}>
          <SectionLabel>{copy.progress.milestones}</SectionLabel>
          {view.milestones.map((m) => (
            <View key={m.kind} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.good }} />
              <Txt kind="bodyStrong" style={{ flex: 1 }}>
                {m.label}
              </Txt>
              <Txt color="textSecondary">{shortDate(m.date)}</Txt>
            </View>
          ))}
        </Card>
      ) : null}

      <Card index={4}>
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
