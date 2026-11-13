import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import type { RomSource } from '@reco/core'

import { RangeFields, parseRange } from '@/components/setup/range-fields'
import { Button } from '@/components/ui/button'
import { Chip, ChipRow } from '@/components/ui/chip'
import { DateField } from '@/components/ui/date-field'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { pathCopy } from '@/copy-path'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

/** ?knee=other measures the uninjured knee once, for the "same as your other knee" checkpoints. */
export default function MeasureScreen() {
  const { knee } = useLocalSearchParams<{ knee?: string }>()
  const isOther = knee === 'other'
  const { today, addMeasurement, updateProfile } = useStore()
  const colors = useColors()
  const [range, setRange] = useState({ bend: '', straighten: '' })
  const [date, setDate] = useState(today)
  const [source, setSource] = useState<Extract<RomSource, 'pt' | 'self'>>('pt')
  const [invalid, setInvalid] = useState(false)

  const save = () => {
    const rom = parseRange(range, date, source)
    if (!rom) {
      setInvalid(true)
      return
    }
    if (isOther) updateProfile({ otherKnee: { flexionDeg: rom.flexionDeg, extensionDeficitDeg: rom.extensionDeficitDeg } })
    else addMeasurement(rom)
    successFeedback()
    router.back()
  }

  return (
    <Screen variant="fullscreen" back={copy.measure.back} eyebrow={isOther ? undefined : copy.measure.eyebrow} title={isOther ? pathCopy.otherKneeTitle : copy.measure.title} subtitle={isOther ? pathCopy.otherKneeBody : undefined}>
      <RangeFields value={range} onChange={setRange} />
      <DateField label={copy.measure.date} value={date} defaultDate={today} max={today} onChange={setDate} />
      <View style={{ gap: space.xs }}>
        <SectionLabel>{copy.measure.who}</SectionLabel>
        <ChipRow>
          <Chip label={copy.measure.my} selected={source === 'pt'} onPress={() => setSource('pt')} />
          <Chip label={copy.measure.me} selected={source === 'self'} onPress={() => setSource('self')} />
        </ChipRow>
      </View>
      {source === 'self' ? (
        <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radius.md, padding: space.md }}>
          <Txt kind="small" color="textSecondary">
            {copy.measure.selfNote}
          </Txt>
        </View>
      ) : null}
      {invalid ? (
        <Txt kind="small" color="warn">
          {copy.measure.invalid}
        </Txt>
      ) : null}
      <Button label={copy.measure.save} onPress={save} />
    </Screen>
  )
}
