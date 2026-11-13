import { useState } from 'react'
import { View } from 'react-native'
import { MANUAL_UNITS, scoreFromUnits } from '@reco/core'
import type { Intensity, ManualActivity } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Chip, ChipRow } from '@/components/ui/chip'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'

const ACTIVITIES: readonly ManualActivity[] = ['practice', 'game', 'gym', 'pt', 'walking', 'rest']
const INTENSITIES: readonly Intensity[] = ['light', 'moderate', 'hard']

/** Tap what you did and how hard. Shows what it adds before saving. */
export function ByHand({ onSaved }: { readonly onSaved: () => void }) {
  const { addActivity, view } = useStore()
  const [activity, setActivity] = useState<ManualActivity | undefined>(undefined)
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const previewScore = activity ? scoreFromUnits(view.todayLoad.units + MANUAL_UNITS[activity][intensity]) : view.todayLoad.score

  const save = () => {
    if (!activity) return
    addActivity(activity, intensity)
    successFeedback()
    onSaved()
  }

  return (
    <View style={{ gap: space.md }}>
      <View style={{ gap: space.sm }}>
        <Txt kind="bodyStrong">{copy.log.activityTitle}</Txt>
        <ChipRow>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={copy.log.activity[a]} selected={activity === a} onPress={() => setActivity(activity === a ? undefined : a)} />
          ))}
        </ChipRow>
      </View>
      <View style={{ gap: space.sm }}>
        <Txt kind="bodyStrong">{copy.log.intensityTitle}</Txt>
        <ChipRow>
          {INTENSITIES.map((i) => (
            <Chip key={i} label={copy.log.intensity[i]} selected={intensity === i} onPress={() => setIntensity(i)} />
          ))}
        </ChipRow>
      </View>
      {activity ? (
        <Txt kind="small" color="textSecondary">
          {copy.log.preview(previewScore - view.todayLoad.score, previewScore)}
        </Txt>
      ) : null}
      <Button label={copy.log.save} disabled={!activity} onPress={save} />
    </View>
  )
}
