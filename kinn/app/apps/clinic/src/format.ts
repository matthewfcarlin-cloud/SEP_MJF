import { daysBetween, startOfDay } from '@reco/core'

const DAYS_SHOWN_AS_AGO = 6

/** "today", "yesterday", "3 days ago", or a short date for anything older. */
export function relativeDay(date: string, today: string): string {
  const ago = daysBetween(date, today)
  if (ago <= 0) return 'today'
  if (ago === 1) return 'yesterday'
  if (ago <= DAYS_SHOWN_AS_AGO) return `${ago} days ago`
  return shortDate(date)
}

/** "Nov 12". */
export function shortDate(date: string): string {
  return new Date(startOfDay(date, 12)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "Wed". */
export function weekday(date: string): string {
  return new Date(startOfDay(date, 12)).toLocaleDateString('en-US', { weekday: 'short' })
}
