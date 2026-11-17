import { useCallback, useEffect, useState } from 'react'

const PREFIX = '#/p/'
export const LIST_HREF = '#/'
export const ADD_HREF = '#/add'

/** The three tabs of a patient's chart, and the plan editor. */
export type ChartView = 'detail' | 'log' | 'exercises' | 'plan'
const SUFFIX: Readonly<Record<Exclude<ChartView, 'detail'>, string>> = { log: '/log', exercises: '/exercises', plan: '/plan' }

export interface Selection {
  readonly id: string
  readonly view: ChartView
}

/** A link to a patient's chart on a given tab, or to their plan editor. */
export const chartHref = (id: string, view: ChartView = 'detail'): string =>
  `${PREFIX}${encodeURIComponent(id)}${view === 'detail' ? '' : SUFFIX[view]}`

/** The open patient and view from the hash (#/p/<id>, #/p/<id>/log, …), or undefined, a malformed link included. */
export function selectionFromHash(hash: string): Selection | undefined {
  if (!hash.startsWith(PREFIX)) return undefined
  const rest = hash.slice(PREFIX.length)
  const found = (Object.entries(SUFFIX) as [Exclude<ChartView, 'detail'>, string][]).find(([, suffix]) => rest.endsWith(suffix))
  const raw = found ? rest.slice(0, -found[1].length) : rest
  try {
    const id = decodeURIComponent(raw)
    return id ? { id, view: found ? found[0] : 'detail' } : undefined
  } catch {
    return undefined
  }
}

/** Kept for callers that only need the patient. */
export const idFromHash = (hash: string): string | undefined => selectionFromHash(hash)?.id

export interface SelectionApi {
  readonly selection: Selection | undefined
  /** The "add a patient" page (#/add). */
  readonly adding: boolean
  readonly select: (id: string, view?: ChartView) => void
}

/** The open patient and view live in the URL, so a link or the back button lands in the same place. */
export function useSelection(): SelectionApi {
  const [hash, setHash] = useState(() => (typeof window === 'undefined' ? '' : window.location.hash))
  const selection = selectionFromHash(hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const select = useCallback((id: string, view: ChartView = 'detail') => {
    window.location.hash = chartHref(id, view)
  }, [])
  return { selection, adding: hash === ADD_HREF, select }
}
