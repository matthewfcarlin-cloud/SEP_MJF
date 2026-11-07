import { TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'

import { SectionLabel } from './section-label'
import { radius, space, type as typeScale } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface FieldProps extends TextInputProps {
  readonly label?: string
}

export function Field({ label, style, ...rest }: FieldProps) {
  const colors = useColors()
  return (
    <View style={{ gap: space.xs }}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[{ ...typeScale.body, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 13, borderWidth: 1, borderColor: colors.border }, style]}
        {...rest}
      />
    </View>
  )
}
