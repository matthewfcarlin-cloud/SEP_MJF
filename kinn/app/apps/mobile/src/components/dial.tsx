import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import type { ReactNode } from 'react'

import { radius } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface DialProps {
  /** 0..100, how far round the ring the arc runs. */
  readonly value: number
  /** Colour of the arc (status colour on Today). */
  readonly color: ColorToken
  readonly size?: number
  readonly children?: ReactNode
}

const RING_STROKE = 7
const DISC_GAP = 16
const FILL_MS = 900

/** Counts up from 0 to `target` with an ease-out, for the mount animation. */
function useCountUp(target: number): number {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const from = shown
    let frame = 0
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / FILL_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(from + (target - from) * eased)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // Re-run only when the target changes; `shown` is read once at the start on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return shown
}

/**
 * The Sensor O as a readout: a faint full track with a live arc on top, starting at 12 o'clock and
 * running clockwise, the same shape as the logo and the coin's ring. The centre is whatever the caller
 * puts in `children`.
 */
export function Dial({ value, color, size = 280, children }: DialProps) {
  const colors = useColors()
  const shown = useCountUp(Math.max(0, Math.min(100, value)))
  const cx = size / 2
  const r = size / 2 - RING_STROKE
  const circumference = 2 * Math.PI * r
  const discR = r - DISC_GAP

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: discR * 2, height: discR * 2, borderRadius: radius.pill, boxShadow: `0 10px 24px ${colors.text}1F` }} />
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="dial-disc" cx="38%" cy="30%" r="75%">
            <Stop offset="0" stopColor={colors.surface} />
            <Stop offset="1" stopColor={colors.surfaceRaised} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cx} r={r} stroke={colors.track} strokeWidth={RING_STROKE} fill="none" />
        {shown > 0 ? (
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            stroke={colors[color]}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${(circumference * shown) / 100} ${circumference}`}
            transform={`rotate(-90 ${cx} ${cx})`}
          />
        ) : null}
        <Circle cx={cx} cy={cx} r={discR} fill="url(#dial-disc)" stroke={colors.border} strokeWidth={1} />
      </Svg>
      <View style={{ width: discR * 2 - 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }}>{children}</View>
    </View>
  )
}
