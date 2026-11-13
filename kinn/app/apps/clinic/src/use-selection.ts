import { useCallback, useEffect, useState } from 'react'

const PREFIX = '#/p/'

/** The patient id in the hash, or undefined for anything else, a malformed link included. */
export function idFromHash(hash: string): string | undefined {
  if (!hash.startsWith(PREFIX)) return undefined
  try {
    return decodeURIComponent(hash.slice(PREFIX.length))
  } catch {
    return undefined
  }
}

/** The open patient lives in the URL (#/p/<id>), so a link or the back button lands on the same patient. */
export function useSelection(): readonly [string | undefined, (id: string) => void] {
  const [selected, setSelected] = useState<string | undefined>(() => (typeof window === 'undefined' ? undefined : idFromHash(window.location.hash)))
  useEffect(() => {
    const onHash = () => setSelected(idFromHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const select = useCallback((id: string) => {
    window.location.hash = `${PREFIX}${encodeURIComponent(id)}`
  }, [])
  return [selected, select]
}
