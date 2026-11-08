import { useEffect } from 'react'
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { scheduleOnRN } from 'react-native-worklets'

import { SWEEP_EASING, SWEEP_MS } from '@/theme/motion'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const FULL = 100

export interface RingProps {
  /** 0..100, how far round the arc runs, clockwise from 12 o'clock. */
  readonly value: number
  readonly color: ColorToken
  readonly size: number
  readonly stroke: number
  /** Sweep from empty on mount. When false (or Reduce Motion is on) the arc is drawn at its value. */
  readonly sweep?: boolean
  readonly delayMs?: number
  /** Called once the arc reaches its value (straight away when it does not sweep). */
  readonly onLanded?: () => void
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(FULL, value))
}

/**
 * The one RECO shape: the O in the wordmark, the coin, the morning score and the live gauge.
 * A faint full track with an arc on top. The arc runs on the UI thread.
 */
export function Ring({ value, color, size, stroke, sweep = false, delayMs = 0, onLanded }: RingProps) {
  const colors = useColors()
  const reduceMotion = useReducedMotion()
  const target = clampPercent(value)
  const animates = sweep && !reduceMotion && target > 0
  const progress = useSharedValue(animates ? 0 : target)

  const cx = size / 2
  const r = size / 2 - stroke
  const circumference = 2 * Math.PI * r

  useEffect(() => {
    if (!animates) {
      progress.set(target)
      onLanded?.()
      return
    }
    progress.set(withDelay(
      delayMs,
      withTiming(target, { duration: SWEEP_MS, easing: SWEEP_EASING }, (finished) => {
        if (finished && onLanded) scheduleOnRN(onLanded)
      }),
    ))
    // Runs when the value changes; the callback and delay are read at that moment on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animates])

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get() / FULL),
    // A round cap draws a dot even at 0, so hide the arc until it has length.
    strokeOpacity: progress.get() > 0.5 ? 1 : 0,
  }))

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cx} r={r} stroke={colors.track} strokeWidth={stroke} fill="none" />
      <AnimatedCircle
        cx={cx}
        cy={cx}
        r={r}
        stroke={colors[color]}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        transform={`rotate(-90 ${cx} ${cx})`}
        animatedProps={arcProps}
      />
    </Svg>
  )
}
