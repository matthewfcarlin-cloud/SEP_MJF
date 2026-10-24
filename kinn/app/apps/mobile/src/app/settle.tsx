import { router } from 'expo-router'
import type { Settled } from '@kinn/core'

import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { Txt } from '@/components/ui/txt'

const ANSWERS: readonly Settled[] = ['yes', 'a-bit', 'no']

export default function SettleScreen() {
  const { view, answerSettle } = useStore()
  const pending = view.pendingSettle[0]

  if (!pending) {
    return (
      <Screen variant="modal" title={copy.pain.settleTitle}>
        <Txt color="textSecondary">{copy.pain.nothingPending}</Txt>
        <Button label={copy.done} variant="secondary" onPress={() => router.back()} />
      </Screen>
    )
  }

  const answer = (settled: Settled) => {
    // Close first: the dispatch below re-renders this screen with nothing pending.
    if (view.pendingSettle.length <= 1) router.back()
    answerSettle(pending.id, settled)
  }

  return (
    <Screen variant="modal" title={copy.pain.settleTitle}>
      <Card>
        <Txt>{copy.pain.settleBody(pending.pain)}</Txt>
      </Card>
      {ANSWERS.map((a) => (
        <Button key={a} label={copy.pain.settle[a]} variant={a === 'yes' ? 'primary' : 'secondary'} onPress={() => answer(a)} />
      ))}
    </Screen>
  )
}
