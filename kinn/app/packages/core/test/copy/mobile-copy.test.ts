/**
 * Walks every string in the mobile copy file (and the output of every copy
 * function with representative arguments) and checks it against the
 * banned-words list. Lives in core so it runs under Vitest with the rest.
 */
import { containsBannedWord, findBannedWords } from '../../src/copy/banned'
import { copy } from '../../../../apps/mobile/src/copy'

const SAMPLE_ARGS: Record<number, unknown[]> = {
  0: [],
  1: ['Maya'],
  2: [42, 30],
}

function* strings(node: unknown, path: string): Generator<[string, string]> {
  if (typeof node === 'string') {
    yield [path, node]
    return
  }
  if (typeof node === 'function') {
    const fn = node as (...args: unknown[]) => unknown
    const numeric = [1, 2, 5, 61]
    const outputs = fn.length === 1 ? [...numeric.map((n) => fn(n)), fn('Maya')] : [fn(...(SAMPLE_ARGS[fn.length] ?? []))]
    for (const out of outputs) if (typeof out === 'string') yield [`${path}()`, out]
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) yield* strings(v, `${path}.${k}`)
  }
}

describe('mobile copy', () => {
  test('contains no banned words anywhere', () => {
    const offenders = [...strings(copy, 'copy')].filter(([, s]) => containsBannedWord(s)).map(([p, s]) => `${p}: "${s}" -> ${findBannedWords(s).join(', ')}`)
    expect(offenders).toEqual([])
  })

  test('has at least one string per screen', () => {
    const all = [...strings(copy, 'copy')]
    expect(all.length).toBeGreaterThan(60)
  })
})
