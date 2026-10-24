/**
 * Words that must never appear in athlete-facing copy, notifications or reports.
 * feature-spec.md section 6.4. Matched as whole words, case-insensitive.
 */
export const BANNED_WORDS: readonly string[] = [
  'compliance',
  'compliant',
  'non-compliant',
  'adherence',
  'adherent',
  'missed',
  'skipped',
  'streak',
  'failed',
  'lazy',
  'policing',
  'surveillance',
  'monitor',
  'patient',
  'diagnose',
  'diagnosis',
  'treat',
  'cure',
  'prevent',
  'predict',
  'risk',
  're-tear',
  'retear',
  'unsafe',
  'danger',
  'dangerous',
  'cleared',
  'ready to return',
]

const pattern = new RegExp(
  `(^|[^A-Za-z0-9])(${BANNED_WORDS.map((w) => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})(?=$|[^A-Za-z0-9])`,
  'i',
)

export function containsBannedWord(text: string): boolean {
  return pattern.test(text)
}

export function findBannedWords(text: string): string[] {
  const lower = text.toLowerCase()
  return BANNED_WORDS.filter((w) =>
    new RegExp(`(^|[^a-z0-9])${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?=$|[^a-z0-9])`).test(lower),
  )
}
