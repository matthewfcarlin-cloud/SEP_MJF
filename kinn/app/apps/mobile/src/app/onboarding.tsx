import { router } from 'expo-router'
import { useState } from 'react'
import { TextInput } from 'react-native'
import { addDays, dayKey } from '@kinn/core'
import type { Injury } from '@kinn/core'

import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { radius, space, type as typeScale } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const INJURIES: readonly Injury[] = ['acl', 'meniscus', 'other']
const SPORTS = ['Basketball', 'Soccer', 'Volleyball', 'Skiing', 'Running', 'Other'] as const
const WHEN = [
  { label: '2 weeks ago', days: 14 },
  { label: '1 month ago', days: 30 },
  { label: '2 months ago', days: 60 },
  { label: '3+ months ago', days: 100 },
] as const

export default function OnboardingScreen() {
  const { setProfile, startWithSample } = useStore()
  const colors = useColors()
  const [injury, setInjury] = useState<Injury>('acl')
  const [when, setWhen] = useState<number>(60)
  const [hadSurgery, setHadSurgery] = useState(true)
  const [sport, setSport] = useState<string>('Basketball')
  const [hasPt, setHasPt] = useState(true)
  const [goal, setGoal] = useState('')
  const [name, setName] = useState('')

  const start = () => {
    setProfile({
      name: name.trim() || 'there',
      injury,
      injuryDate: addDays(dayKey(Date.now()), -when),
      hadSurgery,
      sport,
      hasPt,
      goal: goal.trim() || copy.onboarding.goalPlaceholder,
    })
    router.replace('/')
  }

  const sample = () => {
    startWithSample()
    router.replace('/')
  }

  const inputStyle = {
    ...typeScale.body,
    color: colors.text,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  }

  return (
    <Screen title={copy.onboarding.title}>
      <Card>
        <SectionLabel>Your name</SectionLabel>
        <TextInput value={name} onChangeText={setName} placeholder="Maya" placeholderTextColor={colors.textMuted} style={inputStyle} />
      </Card>
      <Card>
        <SectionLabel>{copy.onboarding.injury}</SectionLabel>
        <ChipRow>
          {INJURIES.map((i) => (
            <Chip key={i} label={copy.onboarding.injuries[i]} selected={injury === i} onPress={() => setInjury(i)} />
          ))}
        </ChipRow>
        <SectionLabel>{copy.onboarding.date}</SectionLabel>
        <ChipRow>
          {WHEN.map((w) => (
            <Chip key={w.days} label={w.label} selected={when === w.days} onPress={() => setWhen(w.days)} />
          ))}
        </ChipRow>
        <SectionLabel>{copy.onboarding.surgery}</SectionLabel>
        <ChipRow>
          <Chip label={copy.onboarding.yes} selected={hadSurgery} onPress={() => setHadSurgery(true)} />
          <Chip label={copy.onboarding.no} selected={!hadSurgery} onPress={() => setHadSurgery(false)} />
        </ChipRow>
      </Card>
      <Card>
        <SectionLabel>{copy.onboarding.sport}</SectionLabel>
        <ChipRow>
          {SPORTS.map((s) => (
            <Chip key={s} label={s} selected={sport === s} onPress={() => setSport(s)} />
          ))}
        </ChipRow>
        <SectionLabel>{copy.onboarding.hasPt}</SectionLabel>
        <ChipRow>
          <Chip label={copy.onboarding.yes} selected={hasPt} onPress={() => setHasPt(true)} />
          <Chip label={copy.onboarding.no} selected={!hasPt} onPress={() => setHasPt(false)} />
        </ChipRow>
        <SectionLabel>{copy.onboarding.goal}</SectionLabel>
        <TextInput value={goal} onChangeText={setGoal} placeholder={copy.onboarding.goalPlaceholder} placeholderTextColor={colors.textMuted} style={inputStyle} />
      </Card>
      <Button label={copy.onboarding.start} onPress={start} />
      <Button label={copy.onboarding.useSample} variant="ghost" onPress={sample} />
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {copy.disclaimerShort}
      </Txt>
    </Screen>
  )
}
