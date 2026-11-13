import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import type { MeasuredBy, Metric } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, ChipRow } from '@/components/ui/chip'
import { Field } from '@/components/ui/field'
import { Screen } from '@/components/ui/screen'
import { Txt } from '@/components/ui/txt'
import { selfTestCopy } from '@/copy-path'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'

/**
 * Stub self-tests: the person answers, the tape takes over the measured ones later.
 * Questionnaires stay placeholders until their licences are checked.
 */
type Kind = 'yes-no' | 'given-way' | 'count' | 'degrees' | 'questionnaire'
type TestMetric = keyof typeof selfTestCopy.notes

const KIND: Readonly<Record<TestMetric, Kind>> = {
  slrNoLag: 'yes-no',
  quadActivationFullExtension: 'yes-no',
  runProgramDonePainFree: 'yes-no',
  instabilityEpisodes7d: 'given-way',
  singleLegSquats60: 'count',
  jointPositionErrorDeg: 'degrees',
  koosSportPct: 'questionnaire',
  ikdcScore: 'questionnaire',
  aclRsiPct: 'questionnaire',
}

/** Giving way and the run program are check-in answers; the rest are self-tests. */
const BY: Partial<Record<TestMetric, MeasuredBy>> = { instabilityEpisodes7d: 'check-in', runProgramDonePainFree: 'check-in' }

const MAX: Readonly<Record<'count' | 'degrees', number>> = { count: 50, degrees: 45 }

const isTestMetric = (m: string | undefined): m is TestMetric => m !== undefined && m in KIND

function NumberAnswer({ kind, onSave }: { readonly kind: 'count' | 'degrees'; readonly onSave: (n: number) => void }) {
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)
  const save = () => {
    const n = Number(text)
    if (text.trim() === '' || !Number.isInteger(n) || n < 0 || n > MAX[kind]) {
      setInvalid(true)
      return
    }
    onSave(n)
  }
  return (
    <>
      <Field label={kind === 'count' ? selfTestCopy.countLabel : selfTestCopy.degreesLabel} value={text} onChangeText={setText} keyboardType="number-pad" maxLength={2} />
      {invalid ? (
        <Txt kind="small" color="warn">
          {selfTestCopy.invalidNumber}
        </Txt>
      ) : null}
      <Button label={selfTestCopy.save} onPress={save} />
    </>
  )
}

function Answer({ kind, onSave }: { readonly kind: Kind; readonly onSave: (value: number | boolean) => void }) {
  if (kind === 'questionnaire') return <Txt color="textSecondary">{selfTestCopy.questionnaireSoon}</Txt>
  if (kind === 'count' || kind === 'degrees') return <NumberAnswer kind={kind} onSave={onSave} />
  const [yes, no] = kind === 'given-way' ? [selfTestCopy.givenWayYes, selfTestCopy.givenWayNo] : [selfTestCopy.yes, selfTestCopy.no]
  return (
    <ChipRow>
      <Chip label={yes} selected={false} onPress={() => onSave(kind === 'given-way' ? 1 : true)} />
      <Chip label={no} selected={false} onPress={() => onSave(kind === 'given-way' ? 0 : false)} />
    </ChipRow>
  )
}

export default function SelfTestScreen() {
  const { metric } = useLocalSearchParams<{ metric?: string }>()
  const { addPathMeasurements } = useStore()
  if (!isTestMetric(metric)) {
    return (
      <Screen variant="modal" title={selfTestCopy.checkInNote}>
        <Button label={selfTestCopy.checkInOpen} onPress={() => router.replace('/checkin')} />
      </Screen>
    )
  }
  const note = selfTestCopy.notes[metric]
  const save = (value: number | boolean) => {
    addPathMeasurements([{ metric: metric as Metric, value, by: BY[metric] ?? 'self-test' }])
    successFeedback()
    router.back()
  }
  return (
    <Screen variant="modal" eyebrow={selfTestCopy.eyebrow} title={note.title}>
      <Card>
        <Txt>{note.how}</Txt>
      </Card>
      <Answer kind={KIND[metric]} onSave={save} />
    </Screen>
  )
}
