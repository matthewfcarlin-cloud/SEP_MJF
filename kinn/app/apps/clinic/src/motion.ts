import type { CSSProperties } from 'react'

/** An item's place in a list, for motion.css to stagger by. */
export function placeInList(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}
