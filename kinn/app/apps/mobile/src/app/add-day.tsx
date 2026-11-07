import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import type { Intensity, ManualActivity } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { PainSlider } from '@/components/ui/pain-slider'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { shortDate } from '@/format'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'

const ACTIVITIES: readonly ManualActivity[] = ['practice', 'game', 'gym', 'pt', 'walking', 'rest']
const INTENSITIES: readonly Intensity[] = ['light', 'moderate', 'hard']

/** For a day that has passed, or a catch-up: an activity, a pain number, or both. */
export default function AddDayScreen() {
  const { date = '' } = useLocalSearchParams<{ date: string }>()
  const { addActivity, addRatedPain } = useStore()
  const [activity, setActivity] = useState<ManualActivity | undefined>(undefined)
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const [pain, setPain] = useState<number | undefined>(undefined)

  const save = () => {
    if (activity) addActivity(activity, intensity, date)
    if (pain !== undefined) addRatedPain(pain, undefined, undefined, date)
    successFeedback()
    router.back()
  }

  return (
    <Screen variant="modal" eyebrow={copy.day.addEyebrow} title={shortDate(date)}>
      <Card>
        <SectionLabel>{copy.day.addActivityTitle}</SectionLabel>
        <ChipRow>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={copy.log.activity[a]} selected={activity === a} onPress={() => setActivity(activity === a ? undefined : a)} />
          ))}
        </ChipRow>
        <SectionLabel>{copy.log.intensityTitle}</SectionLabel>
        <ChipRow>
          {INTENSITIES.map((i) => (
            <Chip key={i} label={copy.log.intensity[i]} selected={intensity === i} onPress={() => setIntensity(i)} />
          ))}
        </ChipRow>
      </Card>
      <Card>
        <SectionLabel>{copy.day.addPainOptional}</SectionLabel>
        <PainSlider value={pain} onChange={setPain} />
      </Card>
      {!activity && pain === undefined ? (
        <Txt kind="small" color="textMuted">
          {copy.day.addNothing}
        </Txt>
      ) : null}
      <Button label={copy.day.addSave} disabled={!activity && pain === undefined} onPress={save} />
    </Screen>
  )
}
