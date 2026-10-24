import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Svg, { Circle, Line } from 'react-native-svg'
import type { ReactNode } from 'react'

import { radius } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface DialProps {
  /** 0..100, how far round the arc the ticks are lit. */
  readonly value: number
  /** Colour of the lit ticks (status colour on Today). */
  readonly color: ColorToken
  readonly size?: number
  /** Second value shown as a thin marker on the arc, e.g. the usual load. */
  readonly marker?: number
  readonly children?: ReactNode
}

const TICKS = 64
const SWEEP_DEG = 270
const START_DEG = 225 // 7:30 on the clock face, sweeping clockwise through 12 to 4:30
const FILL_MS = 900

const polar = (cx: number, cy: number, r: number, deg: number): { x: number; y: number } => {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

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
 * Tick-arc dial in the Oura / Whoop family. Pure SVG; the centre is whatever
 * the caller puts in `children`. Lit ticks glow slightly by drawing a wider,
 * faint copy behind each one.
 */
export function Dial({ value, color, size = 280, marker, children }: DialProps) {
  const colors = useColors()
  const shown = useCountUp(Math.max(0, Math.min(100, value)))
  const cx = size / 2
  const cy = size / 2
  const outer = size / 2 - 6
  const inner = outer - 26
  const lit = Math.round((shown / 100) * TICKS)
  const litColor = colors[color]
  const discR = inner - 18

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {Array.from({ length: TICKS + 1 }, (_, i) => {
          const deg = START_DEG + (i / TICKS) * SWEEP_DEG
          const a = polar(cx, cy, inner, deg)
          const b = polar(cx, cy, outer, deg)
          const isLit = i < lit
          const isEdge = i === lit
          return (
            <Line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={isEdge ? colors.text : isLit ? litColor : colors.track}
              strokeWidth={isEdge ? 4 : 3}
              strokeLinecap="round"
              opacity={isLit || isEdge ? 1 : 0.9}
            />
          )
        })}
        {lit > 0
          ? Array.from({ length: lit }, (_, i) => {
              const deg = START_DEG + (i / TICKS) * SWEEP_DEG
              const a = polar(cx, cy, inner - 2, deg)
              const b = polar(cx, cy, outer + 2, deg)
              return <Line key={`glow-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={litColor} strokeWidth={8} strokeLinecap="round" opacity={0.12} />
            })
          : null}
        {marker !== undefined ? (
          (() => {
            const deg = START_DEG + (Math.max(0, Math.min(100, marker)) / 100) * SWEEP_DEG
            const a = polar(cx, cy, outer + 3, deg)
            const b = polar(cx, cy, outer + 9, deg)
            return <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.textSecondary} strokeWidth={3} strokeLinecap="round" />
          })()
        ) : null}
        <Circle cx={cx} cy={cy} r={discR} fill={colors.surfaceRaised} stroke={colors.border} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={discR - 10} fill="none" stroke={colors.border} strokeWidth={1} opacity={0.7} />
      </Svg>
      <View style={{ width: discR * 2 - 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }}>{children}</View>
    </View>
  )
}
