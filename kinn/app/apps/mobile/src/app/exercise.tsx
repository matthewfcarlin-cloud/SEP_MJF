import { router, useLocalSearchParams } from 'expo-router'

import { ExerciseForm } from '@/components/plan/exercise-form'
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { copy } from '@/copy'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { state, upsertExercise, removeExercise } = useStore()
  const existing = state.data.exercises?.find((e) => e.id === id)
  return (
    <Screen variant="fullscreen" back={copy.plan.title} eyebrow={copy.plan.exercise.eyebrow} title={existing ? copy.plan.exercise.editTitle : copy.plan.exercise.addTitle}>
      <ExerciseForm
        initial={existing}
        onSave={(draft) => {
          upsertExercise({ ...draft, ...(existing ? { id: existing.id } : {}) })
          successFeedback()
          router.back()
        }}
      />
      {existing ? (
        <Button
          label={copy.plan.exercise.remove}
          variant="ghost"
          onPress={() => {
            removeExercise(existing.id)
            router.back()
          }}
        />
      ) : null}
    </Screen>
  )
}
