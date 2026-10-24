import type { Band, Call, Component } from '../domain/types'
import type { ComponentMap } from './score'
import { totalUnits } from './score'
import { ACTIVE_DAY } from './constants'

export interface ReasonInput {
  readonly call: Call
  readonly score: number
  readonly band: Band | undefined
  readonly components: ComponentMap
  readonly excursions: number
  readonly hour: number
  readonly partial: boolean
}

const LABELS: Record<Component, string> = {
  walking: 'walking and daily movement',
  cycling: 'the bike',
  stairs: 'stairs',
  bend: 'bends and squats',
  impact: 'running and jumping',
  pt: 'PT',
  training: 'training',
  deepFlexion: 'time in deep bends',
  overRange: 'bends past your range',
  unknown: 'other movement',
}

interface TopComponent {
  readonly label: string
  readonly share: number
}

function topComponent(components: ComponentMap): TopComponent | undefined {
  const total = totalUnits(components)
  if (total <= 0) return undefined
  const entries = Object.entries(components) as [Component, { units: number } | undefined][]
  const best = entries
    .filter(([, v]) => v && v.units > 0)
    .sort((a, b) => (b[1]?.units ?? 0) - (a[1]?.units ?? 0))[0]
  if (!best || !best[1]) return undefined
  return { label: LABELS[best[0]], share: Math.round((100 * best[1].units) / total) }
}

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

const excursionSentence = (n: number): string =>
  n === 0 ? '' : n === 1 ? ' One bend past this week’s range.' : ` ${n} bends past this week's range.`

const isEarly = (hour: number, score: number): boolean => hour < ACTIVE_DAY.startHour + 3 && score < 10

/**
 * One plain sentence or two explaining the call. Observations only: the copy
 * names what made up the load, never why the knee feels a certain way.
 */
export function reasonFor(input: ReasonInput): string {
  const top = topComponent(input.components)
  const extra = excursionSentence(input.excursions)

  switch (input.call) {
    case 'not-enough-data':
      return 'The coin was off for part of the day, so today’s number is partial. Snap it in and we’ll pick up from here.' + extra
    case 'no-target':
      return 'No target yet for this stage. Your score is shown against your own recent days until your physio sets a range.' + extra
    case 'room-to-push':
      return top
        ? `Mostly ${top.label} so far. There’s room for your strength set or a longer walk.` + extra
        : 'A quiet day so far. There’s room to do more.' + extra
    case 'ease-off':
      if (input.excursions >= 3 && !top) return `${input.excursions} bends past this week's range. Keep it easy tonight.`
      return top
        ? `${capitalise(top.label)} made up ${top.share}% of today’s load. Keep the rest of today light.` + extra
        : 'A heavy day for the knee. Keep the rest of today light.' + extra
    case 'on-target':
      if (isEarly(input.hour, input.score)) return 'Early in the day. Move normally and check back this afternoon.' + extra
      return top
        ? `${capitalise(top.label)} made up ${top.share}% of today’s load. You’re where you want to be.` + extra
        : 'You’re where you want to be today.' + extra
  }
}
