import { router } from 'expo-router'
import type { PainLog } from '@reco/core'
import { WARNING_RULES } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { timeOf } from '@/format'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

/** Replaces the whole top of Today at every guidance level, and stops all other advice. */
export function RedFlagCard({ log }: { readonly log: PainLog }) {
  const { removePain } = useStore()
  const colors = useColors()
  const fromPain = (log.pain ?? 0) >= WARNING_RULES.redFlagPain
  return (
    <>
      <Card style={{ backgroundColor: colors.accent, borderColor: colors.accent, padding: space.lg, gap: space.sm }}>
        <Txt kind="label" color="onAccent">
          {copy.redFlag.label(log.pain, timeOf(log.t))}
        </Txt>
        <Txt kind="title" color="onAccent" style={{ fontSize: 24, lineHeight: 30 }}>
          {copy.redFlag.title}
        </Txt>
        <Txt color="onAccent">{copy.redFlag.body(fromPain ? copy.redFlag.reasonPain(log.pain) : copy.redFlag.reasonNote)}</Txt>
        <Button label={copy.redFlag.guide} variant="secondary" onPress={() => router.push('/red-flags')} style={{ marginTop: space.sm }} />
      </Card>
      <Button label={copy.redFlag.mistake} variant="ghost" onPress={() => removePain(log.id)} />
    </>
  )
}
