/**
 * Walks every string in the mobile copy file (and the output of every copy
 * function with representative arguments) and checks it against the
 * banned-words list. Lives in core so it runs under Vitest with the rest.
 */
import { containsBannedWord, findBannedWords } from '../../src/copy/banned'
import { copy } from '../../../../apps/mobile/src/copy'
import { fromPtCopy, pathCopy, sampleMenuCopy, selfTestCopy, strokeCopy } from '../../../../apps/mobile/src/copy-path'

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
    const attempts: unknown[][] = fn.length === 1 ? [[1], [2], [5], [61], ['Maya'], ['Soccer']] : [SAMPLE_ARGS[fn.length] ?? []]
    for (const args of attempts) {
      let out: unknown
      try {
        out = fn(...args)
      } catch {
        continue // a string function given a number, or vice versa; another attempt will fit
      }
      if (typeof out === 'string') yield [`${path}(${args.join(',')})`, out]
      else if (Array.isArray(out)) yield* strings(out, `${path}(${args.join(',')})`)
    }
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

  test('path, self-test and PT sheet copy contains no banned words, and never clears anyone', () => {
    const all = [...strings({ pathCopy, selfTestCopy, fromPtCopy, sampleMenuCopy, strokeCopy }, 'path')]
    const offenders = all.filter(([, s]) => containsBannedWord(s) || /\b(safe|cleared?|clears|re-?injur\w*|at risk|allowed)\b/i.test(s)).map(([p, s]) => `${p}: "${s}"`)
    expect(offenders).toEqual([])
    expect(all.length).toBeGreaterThan(40)
  })

  test('has at least one string per screen', () => {
    const all = [...strings(copy, 'copy')]
    expect(all.length).toBeGreaterThan(60)
  })
})
