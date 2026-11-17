import { noteAfter, noteFor } from './use-published-note'

describe('the note that a plan was published', () => {
  const note = { page: 'ava:exercises', version: 2, seen: false }

  test('shows on the page it was published to, and nowhere else', () => {
    expect(noteFor(note, 'ava:exercises')).toBe(2)
    expect(noteFor(note, 'ava:detail')).toBeUndefined()
    expect(noteFor(undefined, 'ava:exercises')).toBeUndefined()
  })

  test('waits while the editor is still closing, then is marked as seen', () => {
    expect(noteAfter(note, 'ava:plan')).toBe(note)
    expect(noteAfter(note, 'ava:exercises')).toEqual({ ...note, seen: true })
  })

  test('goes once the PT has seen it and moved on', () => {
    expect(noteAfter({ ...note, seen: true }, 'ava:log')).toBeUndefined()
    expect(noteAfter({ ...note, seen: true }, 'ava:exercises')).toEqual({ ...note, seen: true })
  })
})
