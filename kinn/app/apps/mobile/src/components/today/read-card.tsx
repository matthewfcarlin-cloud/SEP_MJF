import { useState } from 'react'
import { Pressable, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { dailyRead } from '@reco/core'
import type { RomDay } from '@reco/core'

import { Dial } from '@/components/dial'
import { Card } from '@/components/ui/card'
import { SectionLabel } from '@/components/ui/section-label'
import { StatusPill, statusColor } from '@/components/ui/status-pill'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const DIAL_SIZE = 236
const DIAL_ZONE = 256
const STALE_OPACITY = 0.45

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

/** The latest range, always saying who measured it. */
export function RangeTile({ rom }: { readonly rom: RomDay }) {
  const colors = useColors()
  return (
    <View style={{ flexDirection: 'row', gap: space.sm, backgroundColor: colors.surfaceRaised, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: space.md }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt kind="mono">{`${rom.extensionDeficitDeg}°`}</Txt>
        <Txt kind="small" color="textSecondary">
          {copy.read.straightValue(rom.extensionDeficitDeg)}
        </Txt>
      </View>
      <View style={{ flex: 1.4, gap: 2 }}>
        <Txt kind="mono">{`${rom.flexionDeg}°`}</Txt>
        <Txt kind="small" color="textSecondary">
          {copy.read.bendLabel(copy.read.who[rom.source])}
        </Txt>
      </View>
    </View>
  )
}

/** Day 1: nothing to compare with, so no dial and no word. */
export function FirstRead({ index }: { readonly index: number }) {
  const { view, state } = useStore()
  return (
    <Card index={index}>
      <Txt kind="bodyStrong">{dailyRead(view, state.guidance).facts}</Txt>
    </Card>
  )
}

export function ReadCard({ index }: { readonly index: number }) {
  const { view, state } = useStore()
  const [showWhy, setShowWhy] = useState(false)
  const read = dailyRead(view, state.guidance)
  const { meter } = view
  const showing = meter.kind !== 'building'
  return (
    <Card index={index} style={{ gap: space.md, overflow: 'hidden' }}>
      <SectionLabel>{copy.read.callLabel}</SectionLabel>
      <View style={{ height: DIAL_ZONE, marginHorizontal: -space.md, alignItems: 'center', justifyContent: 'center' }}>
        <Horizon />
        <View style={{ opacity: meter.kind === 'stale' ? STALE_OPACITY : 1 }}>
          <Dial value={showing ? meter.percent : 0} color={read.word ? statusColor[view.status.status] : 'textMuted'} size={DIAL_SIZE}>
            <Txt kind="number" style={{ fontSize: 48, lineHeight: 52 }}>
              {showing ? `${meter.percent}` : '–'}
            </Txt>
            <Txt kind="label" color="textMuted">
              {showing ? copy.read.dialLabel : copy.read.dialBuilding}
            </Txt>
          </Dial>
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: space.sm }}>
        {read.word ? (
          <Pressable accessibilityRole="button" accessibilityHint={copy.read.whyMore} hitSlop={10} onPress={() => setShowWhy(!showWhy)}>
            <StatusPill status={view.status.status} word={read.word} large align="center" />
          </Pressable>
        ) : null}
        <Txt color="textSecondary" style={{ textAlign: 'center', paddingHorizontal: space.sm }}>
          {read.suggestion ? `${read.facts} ${read.suggestion}` : read.facts}
        </Txt>
        {showWhy ? (
          <Txt kind="small" color="textMuted" style={{ textAlign: 'center', paddingHorizontal: space.sm }}>
            {`${copy.read.why[view.status.because]} ${copy.read.whyMore}`}
          </Txt>
        ) : null}
      </View>
      {view.latestRom ? <RangeTile rom={view.latestRom} /> : null}
    </Card>
  )
}
