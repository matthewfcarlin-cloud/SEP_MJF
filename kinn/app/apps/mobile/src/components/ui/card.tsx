import { View } from 'react-native'
import type { ViewProps } from 'react-native'

import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export function Card({ style, raised = false, ...rest }: ViewProps & { readonly raised?: boolean }) {
  const colors = useColors()
  return (
    <View
      style={[
        {
          backgroundColor: raised ? colors.surfaceRaised : colors.surface,
          borderRadius: radius.lg,
          padding: space.md,
          gap: space.sm,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    />
  )
}
