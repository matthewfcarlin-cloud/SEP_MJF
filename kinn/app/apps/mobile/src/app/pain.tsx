import { router } from 'expo-router'
import { useState } from 'react'
import type { Doing } from '@kinn/core'

import { copy } from '@/copy'
import { scheduleSettleReminder } from '@/notifications'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { NumberScale } from '@/components/ui/number-scale'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'

const DOING: readonly Doing[] = ['practice', 'game', 'gym', 'pt', 'walking', 'stairs', 'rest', 'other']

export default function PainScreen() {
  const { addPain } = useStore()
  const [pain, setPain] = useState<number | undefined>(undefined)
  const [doing, setDoing] = useState<Doing | undefined>(undefined)
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (pain === undefined) return
    const id = addPain(pain, doing)
    setSaved(true)
    scheduleSettleReminder(id).catch(() => undefined)
    setTimeout(() => router.back(), 900)
  }

  return (
    <Screen modal title={copy.pain.title}>
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
      {saved ? (
        <Txt color="textSecondary" style={{ textAlign: 'center' }}>
          {copy.pain.saved}
        </Txt>
      ) : (
        <Button label={copy.pain.save} disabled={pain === undefined} onPress={save} />
      )}
    </Screen>
  )
}
