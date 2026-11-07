import { useState } from 'react'
import { Pressable, View } from 'react-native'
import type { PlanExercise } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const MAX_COUNT = 99
const DEFAULT_DAYS = 5

export type ExerciseDraft = Omit<PlanExercise, 'id'>

interface ExerciseFormProps {
  readonly initial?: PlanExercise | undefined
  readonly onSave: (draft: ExerciseDraft) => void
}

const whole = (text: string): number | undefined => {
  const n = Number(text)
  return Number.isInteger(n) && n >= 1 && n <= MAX_COUNT ? n : undefined
}

export function ExerciseForm({ initial, onSave }: ExerciseFormProps) {
  const colors = useColors()
  const [name, setName] = useState(initial?.name ?? '')
  const [sets, setSets] = useState(initial ? String(initial.sets) : '')
  const [reps, setReps] = useState(initial ? String(initial.reps) : '')
  const [days, setDays] = useState(initial?.daysPerWeek ?? DEFAULT_DAYS)
  const [note, setNote] = useState(initial?.note ?? '')
  const [showInvalid, setShowInvalid] = useState(false)

  const save = () => {
    const s = whole(sets)
    const r = whole(reps)
    if (!name.trim() || s === undefined || r === undefined) {
      setShowInvalid(true)
      return
    }
    onSave({ name: name.trim(), sets: s, reps: r, daysPerWeek: days, ...(note.trim() ? { note: note.trim() } : {}) })
  }

  return (
    <View style={{ gap: space.md }}>
      <Field label={copy.plan.exercise.name} value={name} onChangeText={setName} placeholder={copy.plan.exercise.namePlaceholder} autoCapitalize="sentences" />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1 }}>
          <Field label={copy.plan.exercise.sets} value={sets} onChangeText={setSets} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label={copy.plan.exercise.reps} value={reps} onChangeText={setReps} keyboardType="number-pad" />
        </View>
      </View>
      <View style={{ gap: space.xs }}>
        <SectionLabel>{copy.plan.exercise.days}</SectionLabel>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const selected = days === n
            return (
              <Pressable
                key={n}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${n} days a week`}
                onPress={() => {
                  tapFeedback()
                  setDays(n)
                }}
                style={{ width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.accent : colors.surface, borderWidth: 1, borderColor: selected ? colors.accent : colors.border }}>
                <Txt kind="small" color={selected ? 'onAccent' : 'text'}>
                  {n}
                </Txt>
              </Pressable>
            )
          })}
        </View>
      </View>
      <Field label={copy.plan.exercise.note} value={note} onChangeText={setNote} placeholder={copy.plan.exercise.notePlaceholder} />
      {showInvalid ? (
        <Txt kind="small" color="warn">
          {copy.plan.exercise.invalid}
        </Txt>
      ) : null}
      <Button label={copy.plan.exercise.save} onPress={save} />
    </View>
  )
}
