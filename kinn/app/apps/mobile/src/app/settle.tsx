import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import type { Settled } from '@reco/core'

import { copy } from '@/copy'
import { successFeedback, tapFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const ANSWERS: readonly Settled[] = ['yes', 'a-bit', 'no']
const TONE: Record<Settled, ColorToken> = { yes: 'good', 'a-bit': 'caution', no: 'warn' }

const timeOf = (t: number): string => {
  const d = new Date(t)
  const h = d.getHours() % 12 || 12
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'am' : 'pm'}`
}

export default function SettleScreen() {
  const { view, answerSettle } = useStore()
  const colors = useColors()
  const [answered, setAnswered] = useState<Settled | undefined>(undefined)
  const pending = view.pendingSettle[0]

  if (answered) {
    return (
      <Screen variant="modal" title={copy.pain.settleTitle}>
        <Card raised style={{ padding: space.lg, gap: space.sm, alignItems: 'center' }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors[TONE[answered]] }} />
          <Txt kind="heading">{copy.pain.settle[answered]}</Txt>
          <Txt color="textSecondary" style={{ textAlign: 'center' }}>
            {copy.pain.settleReaction[answered]}
          </Txt>
        </Card>
        <Button label={copy.done} onPress={() => router.back()} />
      </Screen>
    )
  }

  if (!pending) {
    return (
      <Screen variant="modal" title={copy.pain.settleTitle}>
        <Txt color="textSecondary">{copy.pain.nothingPending}</Txt>
        <Button label={copy.done} variant="secondary" onPress={() => router.back()} />
      </Screen>
    )
  }

  const answer = (settled: Settled) => {
    successFeedback()
    answerSettle(pending.id, settled)
    if (view.pendingSettle.length <= 1) setAnswered(settled)
  }

  return (
    <Screen variant="modal" title={copy.pain.settleTitle}>
      <Card>
        <SectionLabel>{copy.pain.settleLoggedAt(timeOf(pending.t), pending.doing ? copy.doing[pending.doing] : undefined)}</SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
          <Txt kind="number">{pending.pain}</Txt>
          <Txt kind="heading" color="textSecondary">
            {copy.pain.scaleWord(pending.pain)}
          </Txt>
        </View>
        <Txt color="textSecondary">{copy.pain.settleBody(pending.pain)}</Txt>
      </Card>
      <View style={{ gap: space.sm }}>
        {ANSWERS.map((a) => {
          const tone = colors[TONE[a]]
          return (
            <Pressable
              key={a}
              accessibilityRole="button"
              onPress={() => {
                tapFeedback()
                answer(a)
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.md,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              })}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: tone }} />
              <View style={{ flex: 1 }}>
                <Txt kind="bodyStrong">{copy.pain.settle[a]}</Txt>
                <Txt kind="small" color="textMuted">
                  {copy.pain.settleHint[a]}
                </Txt>
              </View>
            </Pressable>
          )
        })}
      </View>
      {view.pendingSettle.length > 1 ? (
        <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
          {copy.pain.settleMore(view.pendingSettle.length - 1)}
        </Txt>
      ) : null}
    </Screen>
  )
}
