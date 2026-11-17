import { useCallback, useEffect, useState } from 'react'

/** A plan version that was just published, and the page that should say so. */
export interface PublishedNote {
  readonly page: string
  readonly version: number
  /** The PT has been on that page since publishing. */
  readonly seen: boolean
}

/** The version to announce on this page, if any. */
export function noteFor(note: PublishedNote | undefined, page: string): number | undefined {
  return note && note.page === page ? note.version : undefined
}

/** The note after the PT lands on a page: kept while the editor closes, marked once seen, gone when they move on. */
export function noteAfter(note: PublishedNote | undefined, page: string): PublishedNote | undefined {
  if (!note) return undefined
  if (note.page === page) return note.seen ? note : { ...note, seen: true }
  return note.seen ? undefined : note
}

/** Says "Version N published." on the page the PT lands on after publishing, until they leave it. */
export function usePublishedNote(page: string): readonly [number | undefined, (toPage: string, version: number) => void] {
  const [note, setNote] = useState<PublishedNote | undefined>(undefined)
  useEffect(() => { setNote((current) => noteAfter(current, page)) }, [page])
  const announce = useCallback((toPage: string, version: number) => setNote({ page: toPage, version, seen: false }), [])
  return [noteFor(note, page), announce]
}
