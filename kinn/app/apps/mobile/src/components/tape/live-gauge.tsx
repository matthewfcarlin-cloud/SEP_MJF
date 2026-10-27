import { View } from 'react-native'
import Svg, { Circle, Line, Polygon, Polyline } from 'react-native-svg'

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
}

const GAUGE_SIZE = 220
const GAUGE_STROKE = 14
const SWEEP_DEG = 270
const START_DEG = 135

/** Arc gauge for live activation, drawn like the Today dial so the two read as one family. */
export function LiveGauge({ pct, threshold, contracting, label }: LiveGaugeProps) {
  const colors = useColors()
  const r = (GAUGE_SIZE - GAUGE_STROKE) / 2
  const c = GAUGE_SIZE / 2
  const circumference = 2 * Math.PI * r
  const sweep = circumference * (SWEEP_DEG / 360)
  const value = Math.max(0, Math.min(100, pct))
  const dash = sweep * (value / 100)
  const thrAngle = ((START_DEG + (SWEEP_DEG * threshold) / 100) * Math.PI) / 180
  const tick = {
    x1: c + (r - GAUGE_STROKE) * Math.cos(thrAngle),
    y1: c + (r - GAUGE_STROKE) * Math.sin(thrAngle),
    x2: c + (r + GAUGE_STROKE * 0.9) * Math.cos(thrAngle),
    y2: c + (r + GAUGE_STROKE * 0.9) * Math.sin(thrAngle),
  }
  const fill = contracting ? colors.good : colors.accent
  return (
    <View style={{ width: GAUGE_SIZE, height: GAUGE_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} style={{ position: 'absolute' }}>
        <Circle cx={c} cy={c} r={r} stroke={colors.track} strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="round" strokeDasharray={`${sweep} ${circumference}`} transform={`rotate(${START_DEG} ${c} ${c})`} />
        <Circle cx={c} cy={c} r={r} stroke={fill} strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} transform={`rotate(${START_DEG} ${c} ${c})`} />
        <Line {...tick} stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <Txt kind="number" style={{ fontSize: 52, lineHeight: 56 }}>
        {Math.round(value)}%
      </Txt>
      <Txt kind="label" color="textMuted">
        {label}
      </Txt>
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
  const points = buffer.map((s) => `${x(s.t).toFixed(1)},${y(s.v).toFixed(1)}`)
  const area = points.length ? `${x(buffer[0]!.t).toFixed(1)},${height} ${points.join(' ')} ${x(end).toFixed(1)},${height}` : ''
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <Line x1={0} x2={width} y1={y(threshold)} y2={y(threshold)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 4" />
      {area ? <Polygon points={area} fill={colors.accent} opacity={0.12} /> : null}
      {points.length > 1 ? <Polyline points={points.join(' ')} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinejoin="round" /> : null}
    </Svg>
  )
}
