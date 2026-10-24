import { Text } from 'react-native'
import type { TextProps } from 'react-native'

import { type as typeScale } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export type TxtProps = TextProps & {
  readonly kind?: keyof typeof typeScale
  readonly color?: ColorToken
}

export function Txt({ kind = 'body', color = 'text', style, ...rest }: TxtProps) {
  const colors = useColors()
  return <Text style={[typeScale[kind], { color: colors[color] }, style]} {...rest} />
}
