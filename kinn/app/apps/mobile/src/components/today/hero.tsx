import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { dailyRead } from '@reco/core'

import { Arrive } from '@/components/arrive'
import { Dial } from '@/components/dial'
import { REVEAL_SWEEP_DELAY_MS } from '@/components/today/morning-reveal'
import { useCountUp } from '@/components/use-count-up'
import { Button } from '@/components/ui/button'
import { StatusPill, statusColor } from '@/components/ui/status-pill'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { POP, SETTLE, STAGGER_MS } from '@/theme/motion'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const DIAL_SIZE = 248
const HORIZON_HEIGHT = 96
const STALE_OPACITY = 0.45
/** The ring's small pop as it lands: up a touch with Pop, back to rest with Settle. */
const LAND_SCALE = 1.035

/** Three soft hills behind the ring: the quiet horizon from the ceramic screens. Decorative. */
function Horizon() {
  const colors = useColors()
  return (
    <Svg width="100%" height={HORIZON_HEIGHT} viewBox="0 0 390 96" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      <Defs>
        {/* No card edge any more, so the hills melt into the page instead of stopping on a line. */}
        <LinearGradient id="horizon-fade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.35" stopColor={colors.bg} stopOpacity={0} />
          <Stop offset="1" stopColor={colors.bg} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Path d="M0 52 C60 30 120 40 180 50 C250 62 310 28 390 40 L390 96 L0 96 Z" fill={colors.horizon} opacity={0.45} />
      <Path d="M0 70 C80 52 150 60 210 68 C280 78 330 56 390 62 L390 96 L0 96 Z" fill={colors.horizon} opacity={0.75} />
      <Path d="M0 84 C90 74 170 82 240 86 C300 89 350 80 390 82 L390 96 L0 96 Z" fill={colors.horizon} />
      <Rect x="0" y="0" width="390" height="96" fill="url(#horizon-fade)" />
    </Svg>
  )
}

/** The one next step, if there is one: check in first, then last night's pain. */
function NextStep() {
  const { view } = useStore()
  if (!view.checkInDone) return <Button label={copy.simple.checkIn} onPress={() => router.push('/checkin')} />
  if (view.pendingSettle[0]) return <Button label={copy.simple.settle} variant="secondary" onPress={() => router.push('/settle')} />
  return null
}

interface TodayHeroProps {
  /** Play the morning reveal: ring sweeps, number counts, the word lands, the line follows. */
  readonly reveal?: boolean
}

/** Today's score, straight on the page: the ring, the word, one line, one next step. */
export function TodayHero({ reveal = false }: TodayHeroProps) {
  const { view, state } = useStore()
  const [showWhy, setShowWhy] = useState(false)
  const [landed, setLanded] = useState(!reveal)
  const read = dailyRead(view, state.guidance)
  const { meter } = view
  const showing = meter.kind !== 'building' && !view.firstDay
  const score = showing ? meter.percent : 0
  // Same delay as the ring, so the number reads off the arc as it sweeps.
  const counted = useCountUp(score, { enabled: reveal && showing, delayMs: REVEAL_SWEEP_DELAY_MS })
  const dialScale = useSharedValue(1)
  const dialStyle = useAnimatedStyle(() => ({ transform: [{ scale: dialScale.get() }] }))
  // Before the check-in the button says what to do, so the line would only repeat it.
  const line = view.checkInDone ? (read.suggestion ?? read.facts) : undefined

  const land = () => {
    if (landed) return
    setLanded(true)
    if (!reveal || !showing) return
    tapFeedback()
    dialScale.set(withSequence(withSpring(LAND_SCALE, POP), withSpring(1, SETTLE)))
  }

  return (
    <View style={{ gap: space.md }}>
      <View style={{ height: DIAL_SIZE + space.lg, marginHorizontal: -space.md, alignItems: 'center', justifyContent: 'center' }}>
        <Horizon />
        <Animated.View style={[{ opacity: meter.kind === 'stale' ? STALE_OPACITY : 1 }, dialStyle]}>
          <Dial value={score} color={read.word ? statusColor[view.status.status] : 'textMuted'} size={DIAL_SIZE} sweep={reveal} sweepDelayMs={REVEAL_SWEEP_DELAY_MS} onLanded={land}>
            <Txt kind="number" style={{ fontSize: 52, lineHeight: 56 }} {...(showing ? { accessibilityLabel: `${score}` } : {})}>
              {showing ? `${counted}` : '–'}
            </Txt>
            <Txt kind="label" color="textMuted">
              {showing ? copy.read.dialLabel : copy.read.dialBuilding}
            </Txt>
          </Dial>
        </Animated.View>
      </View>
      {read.word || line ? (
        <View style={{ alignItems: 'center', gap: space.sm }}>
          {read.word ? (
            <Arrive shown={landed} kind="pop">
              <Pressable accessibilityRole="button" accessibilityHint={copy.read.whyMore} hitSlop={10} onPress={() => setShowWhy(!showWhy)}>
                <StatusPill status={view.status.status} word={read.word} large align="center" />
              </Pressable>
            </Arrive>
          ) : null}
          {line ? (
            <Arrive shown={landed} delayMs={STAGGER_MS}>
              <Txt color="textSecondary" style={{ textAlign: 'center', paddingHorizontal: space.md }}>
                {line}
              </Txt>
            </Arrive>
          ) : null}
          {showWhy ? (
            <Txt kind="small" color="textMuted" style={{ textAlign: 'center', paddingHorizontal: space.md }}>
              {copy.read.why[view.status.because]}
            </Txt>
          ) : null}
        </View>
      ) : null}
      <NextStep />
    </View>
  )
}
