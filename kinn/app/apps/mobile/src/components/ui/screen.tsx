import { ScrollView, View } from 'react-native'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Txt } from './txt'
import { bottomTabInset, maxContentWidth, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface ScreenProps {
  readonly title?: string
  readonly subtitle?: string
  readonly children: ReactNode
  /** Modal screens have no tab bar underneath. */
  readonly modal?: boolean
  readonly right?: ReactNode
}

export function Screen({ title, subtitle, children, modal = false, right }: ScreenProps) {
  const insets = useSafeAreaInsets()
  const colors = useColors()
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: modal ? space.lg : insets.top + space.md,
        paddingBottom: insets.bottom + (modal ? space.xl : bottomTabInset + space.xl),
        paddingHorizontal: space.md,
        alignItems: 'center',
      }}
      keyboardShouldPersistTaps="handled">
      <View style={{ width: '100%', maxWidth: maxContentWidth, gap: space.md }}>
        {title ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.sm }}>
            <View style={{ gap: space.xs, flex: 1 }}>
              <Txt kind="title">{title}</Txt>
              {subtitle ? <Txt color="textSecondary">{subtitle}</Txt> : null}
            </View>
            {right}
          </View>
        ) : null}
        {children}
      </View>
    </ScrollView>
  )
}
