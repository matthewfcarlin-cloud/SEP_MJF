import { ScrollView, View } from 'react-native'
import type { ReactNode } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { Txt } from './txt'
import { bottomTabInset, maxContentWidth, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface ScreenProps {
  readonly title?: string
  readonly subtitle?: string
  readonly children: ReactNode
  /** modal: sheet, no safe-area top. fullscreen: no tab bar. tab: inside the native tabs. */
  readonly variant?: 'tab' | 'modal' | 'fullscreen'
  readonly right?: ReactNode
}

/**
 * Page scaffold. The top safe area comes from SafeAreaView, which measures its
 * own frame, so it is correct whether or not the native tab container already
 * pushed the screen below the status bar (it does for the first tab only).
 */
export function Screen({ title, subtitle, children, variant = 'tab', right }: ScreenProps) {
  const insets = useSafeAreaInsets()
  const colors = useColors()
  return (
    <SafeAreaView edges={variant === 'modal' ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: variant === 'modal' ? space.lg : space.md,
          paddingBottom: insets.bottom + (variant === 'tab' ? bottomTabInset + space.xl : space.xl),
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
    </SafeAreaView>
  )
}
