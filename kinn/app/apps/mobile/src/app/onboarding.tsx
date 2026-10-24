import { router } from 'expo-router'
import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { addDays, dayKey } from '@kinn/core'
import type { Injury } from '@kinn/core'

import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
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
const STEPS = 3

function StepDots({ step }: { readonly step: number }) {
  const colors = useColors()
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: STEPS }, (_, i) => (
        <View key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: radius.pill, backgroundColor: i <= step ? colors.accent : colors.track }} />
      ))}
    </View>
  )
}

export default function OnboardingScreen() {
  const { setProfile, startWithSample } = useStore()
  const colors = useColors()
  const [step, setStep] = useState(0)
  const [injury, setInjury] = useState<Injury>('acl')
  const [when, setWhen] = useState<number>(60)
  const [hadSurgery, setHadSurgery] = useState(true)
  const [name, setName] = useState('')
  const [sport, setSport] = useState<string>('Basketball')
  const [hasPt, setHasPt] = useState(true)
  const [goalChoice, setGoalChoice] = useState<string | undefined>(undefined)
  const [goalText, setGoalText] = useState('')

  const goalChips = copy.onboarding.goalChips(sport)
  const goal = goalChoice === copy.onboarding.goalOther ? goalText.trim() : (goalChoice ?? goalChips[0] ?? '')

  const start = () => {
    setProfile({
      name: name.trim(),
      injury,
      injuryDate: addDays(dayKey(Date.now()), -when),
      hadSurgery,
      sport,
      hasPt,
      goal: goal || copy.onboarding.goalPlaceholder,
    })
    router.replace('/')
  }

  const sample = () => {
    startWithSample()
    router.replace('/')
  }

  const go = (next: number) => {
    tapFeedback()
    setStep(next)
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
    <Screen variant="fullscreen" title={copy.onboarding.stepTitles[step] ?? copy.onboarding.title} subtitle={copy.onboarding.stepOf(step + 1, STEPS)} right={<StepDots step={step} />}>
      {step === 0 ? (
        <Card key="step-0">
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
      ) : null}

      {step === 1 ? (
        <Card key="step-1">
          <SectionLabel>{copy.onboarding.name}</SectionLabel>
          <TextInput value={name} onChangeText={setName} placeholder={copy.onboarding.namePlaceholder} placeholderTextColor={colors.textMuted} style={inputStyle} autoCapitalize="words" />
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
        </Card>
      ) : null}

      {step === 2 ? (
        <Card key="step-2">
          <SectionLabel>{copy.onboarding.goal}</SectionLabel>
          <ChipRow>
            {[...goalChips, copy.onboarding.goalOther].map((g) => (
              <Chip key={g} label={g} selected={(goalChoice ?? goalChips[0]) === g} onPress={() => setGoalChoice(g)} />
            ))}
          </ChipRow>
          {goalChoice === copy.onboarding.goalOther ? (
            <TextInput value={goalText} onChangeText={setGoalText} placeholder={copy.onboarding.goalPlaceholder} placeholderTextColor={colors.textMuted} style={inputStyle} autoFocus />
          ) : null}
          <Txt kind="small" color="textMuted">
            {copy.disclaimerShort}
          </Txt>
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {step > 0 ? <Button label={copy.onboarding.back} variant="secondary" onPress={() => go(step - 1)} style={{ flex: 1 }} /> : null}
        {step < STEPS - 1 ? (
          <Button label={copy.onboarding.next} onPress={() => go(step + 1)} style={{ flex: 2 }} />
        ) : (
          <Button label={copy.onboarding.start} onPress={start} style={{ flex: 2 }} />
        )}
      </View>
      {step === 0 ? <Button label={copy.onboarding.useSample} variant="ghost" onPress={sample} /> : null}
    </Screen>
  )
}
