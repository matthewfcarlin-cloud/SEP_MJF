import { router } from 'expo-router'
import { Pressable, View } from 'react-native'

import { copy } from '@/copy'
import { LiveGauge, LiveTrace } from '@/components/tape/live-gauge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { isConnected, useTape } from '@/tape/use-tape'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const WINDOW_MS = 10_000
const DEFAULT_THRESHOLD_PCT = 30
const MINI_GAUGE = 124

/**
 * The tape on Today. Idle: a one-line invitation to pair or run the demo. Connected: the live
 * signal, small, with a tap through to the full tape screen.
 */
export function TapeLiveCard({ index = 0 }: { readonly index?: number }) {
  const colors = useColors()
  const tape = useTape()
  const t = copy.tape

  if (!tape.source) {
    return (
      <Card index={index}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{t.cardTitle}</SectionLabel>
          <Txt kind="small" color="textMuted">
            {t.phase.disconnected}
          </Txt>
        </View>
        <Txt kind="small" color="textSecondary">
          {t.cardIdle}
        </Txt>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button label={t.connect} variant="secondary" disabled={!tape.support.ok} onPress={() => void tape.connectTape()} style={{ flex: 1 }} />
          <Button label={t.demo} variant="secondary" onPress={() => void tape.startDemo()} style={{ flex: 1 }} />
        </View>
      </Card>
    )
  }

  const connected = isConnected(tape.phase)
  const threshold = tape.status?.thresholdPct ?? DEFAULT_THRESHOLD_PCT
  const pct = tape.latest ? tape.latest.activationPermille / 10 : 0
  const contracting = tape.latest?.contracting ?? false

  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/tape')} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card index={index} style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{t.cardLive}</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: connected ? colors.live : colors.caution }} />
            <Txt kind="small" color="textSecondary">
              {tape.name}
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <LiveGauge pct={pct} threshold={threshold} contracting={contracting} label={t.activation} size={MINI_GAUGE} />
          <View style={{ flex: 1, gap: space.xs }}>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: radius.pill,
                backgroundColor: contracting ? `${colors.good}38` : colors.surface,
                borderWidth: 1,
                borderColor: contracting ? colors.good : colors.border,
              }}>
              <Txt kind="small" color={contracting ? 'text' : 'textSecondary'}>
                {contracting ? t.contracting : t.relaxed}
              </Txt>
            </View>
            <Txt kind="heading">{t.repsLine(tape.reps.length)}</Txt>
            <Txt kind="small" color="textMuted">
              {tape.holdMs !== null ? t.holding((tape.holdMs / 1000).toFixed(1)) : t.squeezeHint}
            </Txt>
          </View>
        </View>
        <LiveTrace buffer={tape.buffer} threshold={threshold} windowMs={WINDOW_MS} height={64} />
        <Txt kind="small" color="textMuted">
          {t.open}
        </Txt>
      </Card>
    </Pressable>
  )
}
