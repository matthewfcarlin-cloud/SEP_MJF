import type { FlagTier } from '@reco/core'

import { copy } from '../copy'

/** The tier as a word in a coloured tag, so it never depends on colour alone. */
export function StatusTag({ tier }: { readonly tier: FlagTier }) {
  return <span className={`tag tag-${tier}`}>{copy.tier[tier]}</span>
}
