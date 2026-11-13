import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import type { Metric, PathMeasurement } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { Field } from '@/components/ui/field'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { fromPtCopy, selfTestCopy } from '@/copy-path'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import type { PathOverrides } from '@/store/state'
import { space } from '@/theme/tokens'

const MAX_PERCENT = 150
const MAX_BEND = 160
const PHASES = [1, 2, 3, 4, 5, 6] as const

const PERCENT_FIELDS: readonly { metric: Metric; label: string }[] = [
  { metric: 'quadIndexPct', label: fromPtCopy.quad },
  { metric: 'hamstringIndexPct', label: fromPtCopy.hamstring },
  { metric: 'gluteIndexPct', label: fromPtCopy.glute },
  { metric: 'hqRatioPct', label: fromPtCopy.hq },
  { metric: 'hopLsiPct', label: fromPtCopy.hop },
]

type Entry = Omit<PathMeasurement, 'date'>
type LimitChoice = 'default' | 'none' | 'set'

/** A number in [0, max], or undefined for an empty field; null when it is not a number. */
function parseBounded(text: string, max: number): number | undefined | null {
  if (text.trim() === '') return undefined
  const n = Number(text)
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null
}

function percentEntries(values: Readonly<Record<string, string>>): readonly Entry[] | null {
  const entries: Entry[] = []
  for (const { metric } of PERCENT_FIELDS) {
    const n = parseBounded(values[metric] ?? '', MAX_PERCENT)
    if (n === null) return null
    if (n !== undefined) entries.push({ metric, value: n, by: 'pt' })
  }
  return entries
}

function YesRow({ label, value, onChange }: { readonly label: string; readonly value: boolean | undefined; readonly onChange: (v: boolean) => void }) {
  return (
    <View style={{ gap: space.xs }}>
      <SectionLabel>{label}</SectionLabel>
      <ChipRow>
        <Chip label={selfTestCopy.yes} selected={value === true} onPress={() => onChange(true)} />
        <Chip label={selfTestCopy.no} selected={value === false} onPress={() => onChange(false)} />
      </ChipRow>
    </View>
  )
}

/** Numbers only the PT can measure, plus the PT's phase and bend-limit overrides. */
export default function FromPtScreen() {
  const { state, addPathMeasurements, setPathOverrides } = useStore()
  const record = state.data.path
  const [values, setValues] = useState<Record<string, string>>({})
  const [gait, setGait] = useState<boolean | undefined>(undefined)
  const [signOff, setSignOff] = useState<boolean | undefined>(undefined)
  const [ptPhase, setPtPhase] = useState<number | undefined>(record?.ptPhase)
  const [limitChoice, setLimitChoice] = useState<LimitChoice>(record?.ptFlexionMaxDeg === undefined ? 'default' : record.ptFlexionMaxDeg === null ? 'none' : 'set')
  const [limitText, setLimitText] = useState(typeof record?.ptFlexionMaxDeg === 'number' ? String(record.ptFlexionMaxDeg) : '')
  const [invalid, setInvalid] = useState(false)

  const save = () => {
    const percents = percentEntries(values)
    const limit = limitChoice === 'set' ? parseBounded(limitText, MAX_BEND) : undefined
    if (!percents || limit === null || (limitChoice === 'set' && limit === undefined)) {
      setInvalid(true)
      return
    }
    const flags: Entry[] = [
      ...(gait !== undefined ? [{ metric: 'normalGait' as const, value: gait, by: 'pt' as const }] : []),
      ...(signOff !== undefined ? [{ metric: 'mdClearance' as const, value: signOff, by: 'pt' as const }] : []),
    ]
    if (percents.length + flags.length > 0) addPathMeasurements([...percents, ...flags])
    const overrides: PathOverrides = { ptPhase, ptFlexionMaxDeg: limitChoice === 'default' ? undefined : limitChoice === 'none' ? null : limit }
    setPathOverrides(overrides)
    successFeedback()
    router.back()
  }

  return (
    <Screen variant="modal" eyebrow={fromPtCopy.eyebrow} title={fromPtCopy.title} subtitle={fromPtCopy.body}>
      <Card>
        <SectionLabel>{fromPtCopy.strength}</SectionLabel>
        {PERCENT_FIELDS.map(({ metric, label }) => (
          <Field key={metric} label={label} value={values[metric] ?? ''} onChangeText={(t) => setValues({ ...values, [metric]: t })} keyboardType="number-pad" maxLength={3} />
        ))}
      </Card>
      <Card>
        <YesRow label={fromPtCopy.gait} value={gait} onChange={setGait} />
        <YesRow label={fromPtCopy.signOff} value={signOff} onChange={setSignOff} />
      </Card>
      <Card>
        <SectionLabel>{fromPtCopy.phase}</SectionLabel>
        <ChipRow>
          <Chip label={fromPtCopy.phaseAuto} selected={ptPhase === undefined} onPress={() => setPtPhase(undefined)} />
          {PHASES.map((n) => (
            <Chip key={n} label={String(n)} selected={ptPhase === n} onPress={() => setPtPhase(n)} />
          ))}
        </ChipRow>
      </Card>
      <Card>
        <SectionLabel>{fromPtCopy.limit}</SectionLabel>
        <ChipRow>
          <Chip label={fromPtCopy.limitDefault} selected={limitChoice === 'default'} onPress={() => setLimitChoice('default')} />
          <Chip label={fromPtCopy.limitNone} selected={limitChoice === 'none'} onPress={() => setLimitChoice('none')} />
          <Chip label={fromPtCopy.limitSet} selected={limitChoice === 'set'} onPress={() => setLimitChoice('set')} />
        </ChipRow>
        {limitChoice === 'set' ? <Field value={limitText} onChangeText={setLimitText} keyboardType="number-pad" maxLength={3} placeholder="90" /> : null}
        <Txt kind="small" color="textMuted">
          {fromPtCopy.limitHint}
        </Txt>
      </Card>
      {invalid ? (
        <Txt kind="small" color="warn">
          {fromPtCopy.invalid}
        </Txt>
      ) : null}
      <Button label={fromPtCopy.save} onPress={save} />
    </Screen>
  )
}
