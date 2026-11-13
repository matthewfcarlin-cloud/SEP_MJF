import { View } from 'react-native'
import { DEFAULT_SAMPLE, defaultDayFor, SAMPLE_PERSONAS } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { sampleMenuCopy } from '@/copy-path'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'

const STEPS = [7, 1] as const

/** Sample mode only: pick a persona and scrub along their recovery. Rebuilds the sample from scratch. */
export function SampleMenu() {
  const { mode, state, setSample } = useStore()
  if (mode !== 'sample') return null
  const choice = state.sample ?? DEFAULT_SAMPLE
  const persona = SAMPLE_PERSONAS.find((p) => p.id === choice.personaId) ?? SAMPLE_PERSONAS[0]!
  const go = (day: number) => setSample({ personaId: persona.id, day: Math.max(1, Math.min(persona.maxDay, day)) })
  return (
    <Card style={{ gap: space.sm }}>
      <SectionLabel>{sampleMenuCopy.label}</SectionLabel>
      <ChipRow>
        {SAMPLE_PERSONAS.map((p) => (
          <Chip key={p.id} label={p.name} selected={p.id === persona.id} onPress={() => setSample({ personaId: p.id, day: defaultDayFor(p.id) })} />
        ))}
      </ChipRow>
      <Txt kind="small" color="textSecondary">
        {persona.story}
      </Txt>
      <Txt kind="bodyStrong">{sampleMenuCopy.day(choice.day)}</Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {STEPS.map((n) => (
          <Button key={`b${n}`} label={sampleMenuCopy.back(n)} variant="secondary" style={{ flex: 1 }} onPress={() => go(choice.day - n)} />
        ))}
        {[...STEPS].reverse().map((n) => (
          <Button key={`f${n}`} label={sampleMenuCopy.forward(n)} variant="secondary" style={{ flex: 1 }} onPress={() => go(choice.day + n)} />
        ))}
      </View>
      <Button label={sampleMenuCopy.reset} variant="ghost" onPress={() => setSample({ personaId: persona.id, day: defaultDayFor(persona.id) })} />
    </Card>
  )
}
