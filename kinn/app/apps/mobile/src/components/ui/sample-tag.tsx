import { View } from 'react-native'

import { Txt } from './txt'
import { copy } from '@/copy'
import { radius } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export function SampleTag({ label = copy.sampleData }: { readonly label?: string }) {
  const colors = useColors()
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
      <Txt kind="label" color="textMuted">
        {label}
      </Txt>
    </View>
  )
}
