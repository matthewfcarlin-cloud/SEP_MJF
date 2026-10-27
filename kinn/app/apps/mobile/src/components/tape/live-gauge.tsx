import { View } from 'react-native'
import Svg, { Circle, Line, Path } from 'react-native-svg'

import { Txt } from '@/components/ui/txt'
import { useColors } from '@/theme/use-tokens'
import type { LiveSample } from '@/tape/use-tape'

interface LiveGaugeProps {
  /** activation 0–100 */
  readonly pct: number
  /** threshold 0–100 */
  readonly threshold: number
  readonly contracting: boolean
  readonly label: string
  readonly size?: number
}

const GAUGE_SIZE = 220
const GAUGE_STROKE = 14
const SWEEP_DEG = 270
const START_DEG = 135

/** Arc gauge for live activation, drawn like the Today dial so the two read as one family. */
export function LiveGauge({ pct, threshold, contracting, label, size = GAUGE_SIZE }: LiveGaugeProps) {
  const colors = useColors()
  const strokeW = Math.round(GAUGE_STROKE * (size / GAUGE_SIZE))
  const r = (size - strokeW) / 2
  const c = size / 2
  const numberSize = Math.round(52 * (size / GAUGE_SIZE))
  const circumference = 2 * Math.PI * r
  const sweep = circumference * (SWEEP_DEG / 360)
  const value = Math.max(0, Math.min(100, pct))
  const dash = sweep * (value / 100)
  const thrAngle = ((START_DEG + (SWEEP_DEG * threshold) / 100) * Math.PI) / 180
  const tick = {
    x1: c + (r - strokeW) * Math.cos(thrAngle),
    y1: c + (r - strokeW) * Math.sin(thrAngle),
    x2: c + (r + strokeW * 0.9) * Math.cos(thrAngle),
    y2: c + (r + strokeW * 0.9) * Math.sin(thrAngle),
  }
  const fill = contracting ? colors.good : colors.accent
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={c} cy={c} r={r} stroke={colors.track} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeDasharray={`${sweep} ${circumference}`} transform={`rotate(${START_DEG} ${c} ${c})`} />
        <Circle cx={c} cy={c} r={r} stroke={fill} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} transform={`rotate(${START_DEG} ${c} ${c})`} />
        <Line {...tick} stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <Txt kind="number" style={{ fontSize: numberSize, lineHeight: numberSize + 4 }}>
        {Math.round(value)}%
      </Txt>
      {size >= GAUGE_SIZE * 0.7 ? (
        <Txt kind="label" color="textMuted">
          {label}
        </Txt>
      ) : null}
    </View>
  )
}

interface LiveTraceProps {
  readonly buffer: readonly LiveSample[]
  readonly threshold: number
  readonly windowMs: number
  readonly height?: number
  readonly width?: number
}

const TRACE_WIDTH = 320
const TRACE_HEIGHT = 120

/** The last ten seconds of activation as a filled trace, with the contraction threshold as a dashed line. */
export function LiveTrace({ buffer, threshold, windowMs, height = TRACE_HEIGHT, width = TRACE_WIDTH }: LiveTraceProps) {
  const colors = useColors()
  const last = buffer[buffer.length - 1]
  const end = last ? last.t : 0
  const x = (t: number) => width - ((end - t) / windowMs) * width
  const y = (v: number) => height - (Math.max(0, Math.min(100, v)) / 100) * (height - 4) - 2
  // Paths rather than polylines: react-native-svg's web polyline does not appear when added after mount.
  const first = buffer[0]
  const line = buffer.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.t).toFixed(1)} ${y(s.v).toFixed(1)}`).join(' ')
  const area = first ? `${line} L${x(end).toFixed(1)} ${height} L${x(first.t).toFixed(1)} ${height} Z` : ''
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <Line x1={0} x2={width} y1={y(threshold)} y2={y(threshold)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 4" />
      <Path d={area} fill={colors.accent} opacity={0.12} />
      <Path d={buffer.length > 1 ? line : ''} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  )
}
