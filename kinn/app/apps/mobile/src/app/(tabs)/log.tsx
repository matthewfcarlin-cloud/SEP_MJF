import { useState } from 'react'
import { View } from 'react-native'
import type { Intensity, ManualActivity } from '@kinn/core'

import { copy } from '@/copy'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { space } from '@/theme/tokens'

const ACTIVITIES: readonly ManualActivity[] = ['practice', 'game', 'gym', 'pt', 'walking', 'rest']
const INTENSITIES: readonly Intensity[] = ['light', 'moderate', 'hard']

export default function LogScreen() {
  const { state, today, addActivity, view } = useStore()
  const [activity, setActivity] = useState<ManualActivity | undefined>(undefined)
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const [justSaved, setJustSaved] = useState(false)
  const todays = state.data.activityLogs.filter((l) => l.date === today)

  const save = () => {
    if (!activity) return
    addActivity(activity, intensity)
    successFeedback()
    setActivity(undefined)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1200)
  }

  return (
    <Screen title={copy.log.title}>
      <Card raised>
        <Txt kind="bodyStrong">{copy.log.autoBanner}</Txt>
        <Txt kind="small" color="textSecondary">
          {copy.log.autoBody}
        </Txt>
      </Card>
      <Card>
        <SectionLabel>{copy.log.activityTitle}</SectionLabel>
        <ChipRow>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={copy.log.activity[a]} selected={activity === a} onPress={() => setActivity(a)} />
          ))}
        </ChipRow>
        <SectionLabel>{copy.log.intensityTitle}</SectionLabel>
        <ChipRow>
          {INTENSITIES.map((i) => (
            <Chip key={i} label={copy.log.intensity[i]} selected={intensity === i} onPress={() => setIntensity(i)} />
          ))}
        </ChipRow>
        <Button label={justSaved ? copy.log.saved : copy.log.save} disabled={!activity} onPress={save} style={{ marginTop: space.sm }} />
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SectionLabel>{copy.log.todaySoFar}</SectionLabel>
          <Txt kind="small" color="textSecondary">
            {copy.today.loadHint(view.todayLoad.score, view.baselineScore)}
          </Txt>
        </View>
        {todays.length === 0 ? (
          <Txt color="textMuted">{copy.log.nothingYet}</Txt>
        ) : (
          todays.map((l) => (
            <Txt key={l.id}>
              {copy.log.activity[l.activity]} · {copy.log.intensity[l.intensity]}
            </Txt>
          ))
        )}
      </Card>
    </Screen>
  )
}
