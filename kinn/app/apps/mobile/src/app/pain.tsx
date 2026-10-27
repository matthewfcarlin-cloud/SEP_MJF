import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import type { Doing } from '@reco/core'

import { copy } from '@/copy'
import { successFeedback } from '@/haptics'
import { scheduleSettleReminder } from '@/notifications'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { NumberScale } from '@/components/ui/number-scale'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { space } from '@/theme/tokens'

const DOING: readonly Doing[] = ['practice', 'game', 'gym', 'pt', 'walking', 'stairs', 'rest', 'other']

const timeNow = (): string => {
  const d = new Date()
  const h = d.getHours() % 12 || 12
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'am' : 'pm'}`
}

export default function PainScreen() {
  const { addPain } = useStore()
  const [pain, setPain] = useState<number | undefined>(undefined)
  const [doing, setDoing] = useState<Doing | undefined>(undefined)
  const [savedAt, setSavedAt] = useState<string | undefined>(undefined)

  const save = () => {
    if (pain === undefined) return
    const id = addPain(pain, doing)
    successFeedback()
    setSavedAt(timeNow())
    scheduleSettleReminder(id).catch(() => undefined)
  }

  if (savedAt !== undefined && pain !== undefined) {
    return (
      <Screen variant="modal" title={copy.pain.savedTitle}>
        <Card raised style={{ padding: space.lg, alignItems: 'center', gap: space.sm }}>
          <Txt kind="number">{pain}</Txt>
          <Txt kind="heading">{copy.pain.scaleWord(pain)}</Txt>
          {doing ? (
            <Txt color="textSecondary">{copy.doing[doing]}</Txt>
          ) : null}
        </Card>
        <Txt color="textSecondary" style={{ textAlign: 'center' }}>
          {copy.pain.savedAt(savedAt)}
        </Txt>
        <Button label={copy.pain.done} onPress={() => router.back()} />
      </Screen>
    )
  }

  return (
    <Screen variant="modal" title={copy.pain.title}>
      <Card>
        <NumberScale value={pain} onChange={setPain} lowLabel={copy.pain.scaleLow} highLabel={copy.pain.scaleHigh} />
      </Card>
      <Card>
        <SectionLabel>{`${copy.pain.doingTitle} · ${copy.pain.doingOptional}`}</SectionLabel>
        <ChipRow>
          {DOING.map((d) => (
            <Chip key={d} label={copy.doing[d]} selected={doing === d} onPress={() => setDoing(doing === d ? undefined : d)} />
          ))}
        </ChipRow>
      </Card>
      <View style={{ gap: space.sm }}>
        <Button label={copy.pain.save} disabled={pain === undefined} onPress={save} />
      </View>
    </Screen>
  )
}
