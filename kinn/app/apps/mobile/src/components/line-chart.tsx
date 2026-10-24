import { View } from 'react-native'
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg'

import { Txt } from './ui/txt'
import { space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface LineChartProps {
  readonly values: readonly number[]
  readonly min: number
  readonly max: number
  readonly color?: ColorToken
  /** Indices to mark with a dot and label. */
  readonly markers?: readonly { readonly index: number; readonly label: string }[]
  readonly height?: number
  readonly unit?: string
  /** Horizontal reference line, in data units. */
  readonly reference?: number
}

const WIDTH = 320

/** A single-series line with a few gridlines. Pure SVG, no chart library. */
export function LineChart({ values, min, max, color = 'accent', markers = [], height = 140, unit = '', reference }: LineChartProps) {
  const colors = useColors()
  const padX = 8
  const padY = 16
  const w = WIDTH - padX * 2
  const h = height - padY * 2
  const n = Math.max(1, values.length - 1)
  const x = (i: number): number => padX + (i / n) * w
  const y = (v: number): number => padY + h - ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * h
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const stroke = colors[color]

  return (
    <View style={{ gap: space.xs }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${WIDTH} ${height}`} preserveAspectRatio="none">
        {[min, (min + max) / 2, max].map((g) => (
          <Line key={g} x1={padX} x2={WIDTH - padX} y1={y(g)} y2={y(g)} stroke={colors.border} strokeWidth={1} />
        ))}
        {reference !== undefined ? (
          <Line x1={padX} x2={WIDTH - padX} y1={y(reference)} y2={y(reference)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 4" />
        ) : null}
        <Polyline points={points} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {markers.map((m) => {
          const v = values[m.index]
          if (v === undefined) return null
          return (
            <Circle key={m.index} cx={x(m.index)} cy={y(v)} r={5} fill={colors.bg} stroke={stroke} strokeWidth={2.5} />
          )
        })}
        <SvgText x={padX} y={y(max) - 4} fill={colors.textMuted} fontSize={10}>
          {`${max}${unit}`}
        </SvgText>
        <SvgText x={padX} y={y(min) + 12} fill={colors.textMuted} fontSize={10}>
          {`${min}${unit}`}
        </SvgText>
      </Svg>
      {markers.length > 0 ? (
        <View style={{ gap: 2 }}>
          {markers.map((m) => (
            <Txt key={m.index} kind="small" color="textSecondary">
              ● {m.label}
            </Txt>
          ))}
        </View>
      ) : null}
    </View>
  )
}
