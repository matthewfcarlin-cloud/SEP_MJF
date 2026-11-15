import { useCallback, useEffect, useState } from 'react'

const PREFIX = '#/p/'
const PLAN_SUFFIX = '/plan'

export interface Selection {
  readonly id: string
  readonly view: 'detail' | 'plan'
}

/** The open patient and view from the hash (#/p/<id> or #/p/<id>/plan), or undefined, a malformed link included. */
export function selectionFromHash(hash: string): Selection | undefined {
  if (!hash.startsWith(PREFIX)) return undefined
  const rest = hash.slice(PREFIX.length)
  const isPlan = rest.endsWith(PLAN_SUFFIX)
  const raw = isPlan ? rest.slice(0, -PLAN_SUFFIX.length) : rest
  try {
    const id = decodeURIComponent(raw)
    return id ? { id, view: isPlan ? 'plan' : 'detail' } : undefined
  } catch {
    return undefined
  }
}

/** Kept for callers that only need the patient. */
export const idFromHash = (hash: string): string | undefined => selectionFromHash(hash)?.id

export interface SelectionApi {
  readonly selection: Selection | undefined
  readonly select: (id: string) => void
  readonly openPlan: (id: string) => void
}

/** The open patient and view live in the URL, so a link or the back button lands in the same place. */
export function useSelection(): SelectionApi {
  const [selection, setSelection] = useState<Selection | undefined>(() => (typeof window === 'undefined' ? undefined : selectionFromHash(window.location.hash)))
  useEffect(() => {
    const onHash = () => setSelection(selectionFromHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const select = useCallback((id: string) => {
    window.location.hash = `${PREFIX}${encodeURIComponent(id)}`
  }, [])
  const openPlan = useCallback((id: string) => {
    window.location.hash = `${PREFIX}${encodeURIComponent(id)}${PLAN_SUFFIX}`
  }, [])
  return { selection, select, openPlan }
}
