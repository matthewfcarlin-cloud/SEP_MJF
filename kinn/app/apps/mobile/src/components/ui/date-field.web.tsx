import { createElement } from 'react'
import { View } from 'react-native'

import { Button } from './button'
import { SectionLabel } from './section-label'
import type { DateFieldProps } from './date-field'
import { space } from '@/theme/tokens'

export function DateField({ label, value, onChange, addLabel, defaultDate, min, max }: DateFieldProps) {
  return (
    <View style={{ gap: space.xs, alignItems: 'flex-start' }}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      {value === undefined && addLabel ? (
        <Button label={addLabel} variant="secondary" onPress={() => onChange(defaultDate)} />
      ) : (
        createElement('input', {
          type: 'date',
          value: value ?? defaultDate,
          min,
          max,
          onChange: (e: { target: { value: string } }) => {
            if (e.target.value) onChange(e.target.value)
          },
        })
      )}
    </View>
  )
}
