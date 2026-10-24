import { View } from 'react-native'

import { Txt } from './txt'
import { radius } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export interface Bar {
  readonly key: string
  /** 0..100 */
  readonly value: number
  readonly label?: string
  readonly color?: ColorToken
}

/** Simple bar row, 0..100, with optional per-bar labels underneath. */
export function Bars({ bars, height = 64 }: { readonly bars: readonly Bar[]; readonly height?: number }) {
  const colors = useColors()
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end' }}>
      {bars.map((b) => (
        <View key={b.key} style={{ flex: 1, alignItems: 'stretch', gap: 4 }}>
          <View style={{ height, justifyContent: 'flex-end', backgroundColor: colors.track, borderRadius: radius.sm, overflow: 'hidden' }}>
            <View
              style={{
                height: `${Math.max(2, Math.min(100, b.value))}%`,
                backgroundColor: colors[b.color ?? 'accent'],
                borderRadius: radius.sm,
              }}
            />
          </View>
          {b.label !== undefined ? (
            <Txt kind="label" color="textMuted" style={{ textAlign: 'center', fontSize: 10 }}>
              {b.label}
            </Txt>
          ) : null}
        </View>
      ))}
    </View>
  )
}
