import DateTimePicker from '@react-native-community/datetimepicker'
import { localDateKey, startOfDay } from '@reco/core'
import { View } from 'react-native'

import { Button } from './button'
import { SectionLabel } from './section-label'
import { space } from '@/theme/tokens'

export interface DateFieldProps {
  readonly label?: string
  /** YYYY-MM-DD, or undefined while no date is chosen. */
  readonly value: string | undefined
  readonly onChange: (date: string) => void
  /** Offered when no date is chosen yet. */
  readonly addLabel?: string
  readonly defaultDate: string
  readonly min?: string
  readonly max?: string
}

const noon = (date: string): Date => new Date(startOfDay(date, 12))

export function DateField({ label, value, onChange, addLabel, defaultDate, min, max }: DateFieldProps) {
  return (
    <View style={{ gap: space.xs, alignItems: 'flex-start' }}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      {value === undefined && addLabel ? (
        <Button label={addLabel} variant="secondary" onPress={() => onChange(defaultDate)} />
      ) : (
        <DateTimePicker
          mode="date"
          display="compact"
          value={noon(value ?? defaultDate)}
          {...(min ? { minimumDate: noon(min) } : {})}
          {...(max ? { maximumDate: noon(max) } : {})}
          onValueChange={(_, d) => onChange(localDateKey(d.getTime()))}
        />
      )}
    </View>
  )
}
