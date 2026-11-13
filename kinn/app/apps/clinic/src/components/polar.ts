/** Geometry for the Week Ring: hours of the week to angles, clockwise from 12 o'clock. */
import { HOURS_PER_DAY, WEEK_HOURS } from '@reco/core'

export interface Point {
  readonly x: number
  readonly y: number
}

/** Degrees clockwise from 12 o'clock for an hour of the week (0 to 168). */
export const angleOf = (weekHour: number): number => (weekHour / WEEK_HOURS) * 360

export const weekHour = (dayIndex: number, hour: number): number => dayIndex * HOURS_PER_DAY + hour

export function polar(cx: number, cy: number, r: number, degrees: number): Point {
  const rad = ((degrees - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** An SVG path for the arc of radius r from one angle to another, clockwise. */
export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const a = polar(cx, cy, r, from)
  const b = polar(cx, cy, r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

/** A filled wedge between two radii, for a day's hit area. */
export function wedgePath(cx: number, cy: number, rIn: number, rOut: number, from: number, to: number): string {
  const o1 = polar(cx, cy, rOut, from)
  const o2 = polar(cx, cy, rOut, to)
  const i2 = polar(cx, cy, rIn, to)
  const i1 = polar(cx, cy, rIn, from)
  const large = to - from > 180 ? 1 : 0
  return [
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
    `L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}
