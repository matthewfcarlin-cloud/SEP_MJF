import { View } from 'react-native'
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polyline, Stop, Text as SvgText } from 'react-native-svg'

import { Txt } from './ui/txt'
import { space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export interface ChartMarker {
  readonly index: number
  readonly label: string
}

interface LineChartProps {
  readonly values: readonly number[]
  readonly min: number
  readonly max: number
  readonly color?: ColorToken
  /** Indices to mark with a dot and a numbered flag; the legend below lists them. */
  readonly markers?: readonly ChartMarker[]
  readonly height?: number
  readonly unit?: string
  /** Horizontal reference line, in data units, with an optional label. */
  readonly reference?: number
  readonly referenceLabel?: string
  /** Labels for the x axis: [first, middle, last]. */
  readonly xLabels?: readonly [string, string, string]
  /** Fill the area under the line. */
  readonly area?: boolean
}

const WIDTH = 320
const PAD_X = 10
const PAD_TOP = 18
const PAD_BOTTOM = 22

/** A single-series line with gridlines, optional area fill, numbered milestone flags and a date axis. Pure SVG. */
export function LineChart({ values, min, max, color = 'accent', markers = [], height = 150, unit = '', reference, referenceLabel, xLabels, area = false }: LineChartProps) {
  const colors = useColors()
  const w = WIDTH - PAD_X * 2
  const h = height - PAD_TOP - PAD_BOTTOM
  const n = Math.max(1, values.length - 1)
  const x = (i: number): number => PAD_X + (i / n) * w
  const y = (v: number): number => PAD_TOP + h - ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * h
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const stroke = colors[color]
  const baseline = y(min)
  const areaPath = `M${x(0)},${baseline} L${points.split(' ').join(' L')} L${x(values.length - 1)},${baseline} Z`
  const gradientId = `area-${color}`

  return (
    <View style={{ gap: space.xs }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${WIDTH} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={stroke} stopOpacity={0.28} />
            <Stop offset="1" stopColor={stroke} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {[min, (min + max) / 2, max].map((g) => (
          <Line key={g} x1={PAD_X} x2={WIDTH - PAD_X} y1={y(g)} y2={y(g)} stroke={colors.border} strokeWidth={1} />
        ))}
        {area && values.length > 1 ? <Path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        {reference !== undefined ? (
          <>
            <Line x1={PAD_X} x2={WIDTH - PAD_X} y1={y(reference)} y2={y(reference)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 4" />
            {referenceLabel ? (
              <SvgText x={PAD_X + 2} y={y(reference) - 4} fill={colors.textMuted} fontSize={10}>
                {referenceLabel}
              </SvgText>
            ) : null}
          </>
        ) : null}
        <Polyline points={points} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {markers.map((m, k) => {
          const v = values[m.index]
          if (v === undefined) return null
          const cx = x(m.index)
          const cy = y(v)
          return (
            <G key={m.index}>
              <Circle cx={cx} cy={cy} r={5} fill={colors.bg} stroke={stroke} strokeWidth={2.5} />
              <Circle cx={cx} cy={cy - 16} r={8} fill={stroke} />
              <SvgText x={cx} y={cy - 12.5} fill={colors.bg} fontSize={10} fontWeight="700" textAnchor="middle">
                {String(k + 1)}
              </SvgText>
            </G>
          )
        })}
        <SvgText x={PAD_X} y={PAD_TOP - 6} fill={colors.textMuted} fontSize={10}>
          {`${max}${unit}`}
        </SvgText>
        <SvgText x={PAD_X} y={baseline + 12} fill={colors.textMuted} fontSize={10}>
          {`${min}${unit}`}
        </SvgText>
        {xLabels ? (
          <>
            <SvgText x={PAD_X + 44} y={height - 4} fill={colors.textMuted} fontSize={10}>
              {xLabels[0]}
            </SvgText>
            <SvgText x={WIDTH / 2} y={height - 4} fill={colors.textMuted} fontSize={10} textAnchor="middle">
              {xLabels[1]}
            </SvgText>
            <SvgText x={WIDTH - PAD_X} y={height - 4} fill={colors.textMuted} fontSize={10} textAnchor="end">
              {xLabels[2]}
            </SvgText>
          </>
        ) : null}
      </Svg>
      {markers.length > 0 ? (
        <View style={{ gap: 2 }}>
          {markers.map((m, k) => (
            <View key={m.index} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: stroke, alignItems: 'center', justifyContent: 'center' }}>
                <Txt kind="label" style={{ color: colors.bg, fontSize: 10, lineHeight: 12 }}>
                  {String(k + 1)}
                </Txt>
              </View>
              <Txt kind="small" color="textSecondary">
                {m.label}
              </Txt>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}
