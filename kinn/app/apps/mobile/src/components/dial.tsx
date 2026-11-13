import { View } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import type { ReactNode } from 'react'

import { Ring } from '@/components/ring'
import { radius } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface DialProps {
  /** 0..100, how far round the ring the arc runs. */
  readonly value: number
  /** Colour of the arc (status colour on Today). */
  readonly color: ColorToken
  readonly size?: number
  /** Sweep the ring from empty on mount (the morning reveal). */
  readonly sweep?: boolean
  readonly sweepDelayMs?: number
  readonly onLanded?: () => void
  readonly children?: ReactNode
}

const RING_STROKE = 7
const DISC_GAP = 16

/** The Ring as a readout: a ceramic disc inside the ring, with whatever the caller puts in `children`. */
export function Dial({ value, color, size = 280, sweep = false, sweepDelayMs = 0, onLanded, children }: DialProps) {
  const colors = useColors()
  const cx = size / 2
  const discR = size / 2 - RING_STROKE - DISC_GAP

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: discR * 2, height: discR * 2, borderRadius: radius.pill, boxShadow: `0 10px 24px ${colors.text}1F` }} />
      <View style={{ position: 'absolute' }}>
        <Ring value={value} color={color} size={size} stroke={RING_STROKE} sweep={sweep} delayMs={sweepDelayMs} {...(onLanded ? { onLanded } : {})} />
      </View>
      <Svg width={size} height={size} style={{ position: 'absolute' }} pointerEvents="none">
        <Defs>
          <RadialGradient id="dial-disc" cx="38%" cy="30%" r="75%">
            <Stop offset="0" stopColor={colors.surface} />
            <Stop offset="1" stopColor={colors.surfaceRaised} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cx} r={discR} fill="url(#dial-disc)" stroke={colors.border} strokeWidth={1} />
      </Svg>
      <View style={{ width: discR * 2 - 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }}>{children}</View>
    </View>
  )
}
