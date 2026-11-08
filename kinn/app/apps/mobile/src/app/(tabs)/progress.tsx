import { router } from 'expo-router'
import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { ROM_TARGETS } from '@reco/core'
import type { MeterState, MilestoneKind, RomDay } from '@reco/core'

import { LineChart } from '@/components/line-chart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle } from '@/components/ui/check'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { shortDate } from '@/format'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const RING = 64
const RING_STROKE = 5
const STALE_OPACITY = 0.45
const WEEKS_PER_MONTH = 4.345

function Ring({ percent, faded }: { readonly percent: number | undefined; readonly faded: boolean }) {
  const colors = useColors()
  const r = (RING - RING_STROKE) / 2
  const c = 2 * Math.PI * r
  return (
    <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center', opacity: faded ? STALE_OPACITY : 1 }}>
      <Svg width={RING} height={RING} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={RING / 2} cy={RING / 2} r={r} stroke={colors.track} strokeWidth={RING_STROKE} fill="none" />
        {percent !== undefined ? <Circle cx={RING / 2} cy={RING / 2} r={r} stroke={colors.accent} strokeWidth={RING_STROKE} fill="none" strokeDasharray={`${(c * percent) / 100} ${c}`} strokeLinecap="round" /> : null}
      </Svg>
      <Txt kind="mono">{percent ?? '–'}</Txt>
    </View>
  )
}

function WhoTag({ rom }: { readonly rom: RomDay }) {
  const colors = useColors()
  return (
    <View style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }}>
      <Txt kind="label" color="textMuted">
        {copy.read.whoTag[rom.source]}
      </Txt>
    </View>
  )
}

function BuildingMeter({ meter }: { readonly meter: Extract<MeterState, { kind: 'building' }> }) {
  return (
    <Card index={0} style={{ gap: 0 }}>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center', paddingBottom: space.sm }}>
        <Ring percent={undefined} faded={false} />
        <View style={{ flex: 1 }}>
          <SectionLabel>{copy.meter.label}</SectionLabel>
          <Txt kind="bodyStrong">{copy.meter.buildingTitle}</Txt>
        </View>
      </View>
      <ListRow title={copy.meter.addRange} sub={copy.meter.addRangeSub} right={<CheckCircle done={meter.hasRange} />} {...(meter.hasRange ? {} : { onPress: () => router.push('/measure') })} />
      <ListRow title={copy.meter.logDays(meter.daysNeeded)} sub={copy.meter.logDaysSub(Math.min(meter.loggedDays, meter.daysNeeded), meter.daysNeeded)} right={<CheckCircle done={meter.loggedDays >= meter.daysNeeded} />} />
    </Card>
  )
}

function ShownMeter({ meter }: { readonly meter: Extract<MeterState, { kind: 'normal' | 'stale' }> }) {
  const { view } = useStore()
  const stale = meter.kind === 'stale'
  const { delta, reason } = view.progressChange
  const headline = stale ? copy.meter.lastMeasured(shortDate(meter.lastMeasured.date)) : delta > 0 ? copy.meter.up(delta) : delta < 0 ? copy.meter.down(-delta) : copy.meter.flat
  return (
    <Card index={0}>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <Ring percent={meter.percent} faded={stale} />
        <View style={{ flex: 1, gap: 2 }}>
          <SectionLabel>{copy.meter.label}</SectionLabel>
          <Txt kind="bodyStrong">{headline}</Txt>
          <Txt kind="small" color="textSecondary">
            {stale ? copy.meter.staleBody : copy.meter.reason[reason]}
          </Txt>
        </View>
      </View>
      {stale ? (
        <Button label={copy.meter.add} onPress={() => router.push('/measure')} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt kind="small" color="textSecondary">
            {copy.meter.lastMeasured(shortDate(meter.lastMeasured.date))}
          </Txt>
          <WhoTag rom={meter.lastMeasured} />
        </View>
      )}
    </Card>
  )
}

function RangeCards({ rom, faded }: { readonly rom: readonly RomDay[]; readonly faded: boolean }) {
  const colors = useColors()
  const first = rom[0]
  const latest = rom.at(-1)
  if (!first || !latest) {
    return (
      <Card index={1}>
        <SectionLabel>{copy.meter.emptyRangeLabel}</SectionLabel>
        <Txt color="textSecondary">{copy.meter.emptyRangeBody}</Txt>
      </Card>
    )
  }
  const xLabels = [shortDate(first.date), shortDate(rom[Math.floor(rom.length / 2)]?.date ?? first.date), shortDate(latest.date)] as const
  return (
    <View style={{ gap: space.md, opacity: faded ? STALE_OPACITY : 1 }}>
      <Card index={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <SectionLabel>{copy.progress.flexion}</SectionLabel>
            <Txt kind="number" style={{ fontSize: 36, lineHeight: 42, letterSpacing: -1 }}>{`${latest.flexionDeg}°`}</Txt>
          </View>
          {rom.length > 1 ? (
            <Txt kind="small" color="textSecondary">
              {copy.meter.sinceFirst(latest.flexionDeg - first.flexionDeg)}
            </Txt>
          ) : null}
        </View>
        {rom.length > 1 ? <LineChart values={rom.map((d) => d.flexionDeg)} min={Math.min(90, ...rom.map((d) => d.flexionDeg))} max={ROM_TARGETS.fullFlexionDeg} unit="°" area reference={ROM_TARGETS.bikeFlexionDeg} referenceLabel={copy.progress.bikeLine} xLabels={xLabels} /> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Txt kind="bodyStrong">{copy.progress.extension}</Txt>
          <Txt kind="small" color="textSecondary">{`${latest.extensionDeficitDeg}° · ${copy.read.straightValue(latest.extensionDeficitDeg)}`}</Txt>
        </View>
      </Card>
    </View>
  )
}

function Milestones({ latest }: { readonly latest: RomDay | undefined }) {
  const { view } = useStore()
  if (!latest) return null
  const reached = (k: MilestoneKind) => view.milestones.find((m) => m.kind === k)
  const rows: readonly { kind: MilestoneKind; title: string; left: number }[] = [
    { kind: 'full-straightening', title: copy.meter.fullyStraight, left: Math.max(0, latest.extensionDeficitDeg - ROM_TARGETS.straightDeg) },
    { kind: 'bike-range', title: copy.meter.bike, left: Math.max(0, ROM_TARGETS.bikeFlexionDeg - latest.flexionDeg) },
    { kind: 'full-bend', title: copy.meter.fullBend, left: Math.max(0, ROM_TARGETS.fullFlexionDeg - latest.flexionDeg) },
  ]
  return (
    <Card index={3} style={{ gap: 0 }}>
      <SectionLabel spaced>{copy.meter.milestones}</SectionLabel>
      {rows.map((r) => {
        const hit = reached(r.kind)
        return <ListRow key={r.kind} title={r.title} sub={hit ? copy.meter.reached(shortDate(hit.date)) : copy.meter.toGo(r.left)} right={<CheckCircle done={hit !== undefined} />} />
      })}
    </Card>
  )
}

function TypicalReturn() {
  const { view, state } = useStore()
  const { profile } = state.data
  const { lowWeeks, highWeeks } = view.plan.typicalReturn
  const words = profile.hadSurgery ? copy.meter.surgeryWord : copy.meter.injuryWord
  const word = words[profile.injury as keyof typeof words] ?? words.other
  return (
    <Card index={4}>
      <SectionLabel>{copy.meter.backLabel}</SectionLabel>
      <Txt kind="bodyStrong">{copy.meter.typical(word, Math.ceil(lowWeeks / WEEKS_PER_MONTH), Math.round(highWeeks / WEEKS_PER_MONTH))}</Txt>
      <Txt kind="small" color="textSecondary">
        {copy.meter.typicalNote}
      </Txt>
    </Card>
  )
}

export default function ProgressScreen() {
  const { view, state, mode } = useStore()
  const rom = [...state.data.romDays].sort((a, b) => a.date.localeCompare(b.date))
  const { meter } = view
  return (
    <Screen title={copy.progress.title}>
      {meter.kind === 'building' ? <BuildingMeter meter={meter} /> : <ShownMeter meter={meter} />}
      <RangeCards rom={rom} faded={meter.kind === 'stale'} />
      {mode === 'real' && meter.kind !== 'stale' ? <Button label={copy.meter.add} variant="secondary" onPress={() => router.push('/measure')} /> : null}
      <Milestones latest={rom.at(-1)} />
      <TypicalReturn />
    </Screen>
  )
}
