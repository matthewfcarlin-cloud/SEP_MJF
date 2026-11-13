import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'react-native-reanimated'

import { STAGGER_MS, SWEEP_MS } from '@/theme/motion'

/**
 * The morning reveal plays on the first look at Today each day. After that the score is just there.
 * The last day it played is kept on the phone; the read starts at import so it is back long before
 * the store has loaded and Today first renders.
 */
const STORAGE_KEY = 'reco.reveal.lastDay.v1'

/** The ring waits for the read card to arrive, then sweeps. */
export const REVEAL_SWEEP_DELAY_MS = 120
/** Cards below the read wait until the ring lands. */
export const REVEAL_CARDS_LEAD_MS = REVEAL_SWEEP_DELAY_MS + SWEEP_MS - STAGGER_MS

let lastRevealDay: string | null = null
let isLoaded = false

AsyncStorage.getItem(STORAGE_KEY)
  .then((day) => {
    lastRevealDay = day
  })
  .catch((error: unknown) => console.warn('RECO: could not read the reveal day.', error))
  .finally(() => {
    isLoaded = true
  })

function markRevealed(day: string): void {
  lastRevealDay = day
  AsyncStorage.setItem(STORAGE_KEY, day).catch((error: unknown) => console.warn('RECO: could not save the reveal day.', error))
}

/**
 * True when Today should play the morning reveal on this mount. `hasScore` is false on day 1 and
 * red-flag days, which have no ring to reveal and do not use up the day's reveal. Decided once per
 * mount, so re-renders keep the score still. Reduce Motion turns it off.
 */
export function useMorningReveal(today: string, hasScore: boolean): boolean {
  const reduceMotion = useReducedMotion()
  // If the stored day has not come back yet, play: a second reveal is better than none.
  const [isFresh] = useState(() => !reduceMotion && (!isLoaded || lastRevealDay !== today))
  const plays = isFresh && hasScore
  useEffect(() => {
    if (plays) markRevealed(today)
  }, [plays, today])
  return plays
}
