import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Pressable, ScrollView, View } from 'react-native'
import type { ReactNode } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { SampleBanner } from './sample-banner'
import { Txt } from './txt'
import { bottomTabInset, maxContentWidth, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface ScreenProps {
  /** Small mono line above the title. */
  readonly eyebrow?: string
  readonly title?: string
  readonly subtitle?: string
  readonly children: ReactNode
  /** modal: sheet, no safe-area top. fullscreen: no tab bar. tab: inside the native tabs. */
  readonly variant?: 'tab' | 'modal' | 'fullscreen'
  readonly right?: ReactNode
  /** Shows a back row with this label above the title. */
  readonly back?: string
}

function BackRow({ label }: { readonly label: string }) {
  const colors = useColors()
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={12} onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm }}>
      <SymbolView name="chevron.left" size={14} tintColor={colors.text} />
      <Txt kind="small">{label}</Txt>
    </Pressable>
  )
}

/**
 * Page scaffold. The top safe area comes from SafeAreaView, which measures its
 * own frame, so it is correct whether or not the native tab container already
 * pushed the screen below the status bar (it does for the first tab only).
 */
export function Screen({ eyebrow, title, subtitle, children, variant = 'tab', right, back }: ScreenProps) {
  const insets = useSafeAreaInsets()
  const colors = useColors()
  return (
    <SafeAreaView edges={variant === 'tab' ? ['top'] : []} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          // Full-screen modals get the device inset directly; SafeAreaView can measure 0 while the modal is still presenting.
          paddingTop: variant === 'modal' ? space.lg : variant === 'fullscreen' ? insets.top + space.md : space.md,
          paddingBottom: insets.bottom + (variant === 'tab' ? bottomTabInset + space.xl : space.xl),
          paddingHorizontal: space.md,
          alignItems: 'center',
        }}
        keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', maxWidth: maxContentWidth, gap: space.md }}>
          {variant === 'tab' ? <SampleBanner /> : null}
          {back ? <BackRow label={back} /> : null}
          {title ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: space.sm, gap: space.sm }}>
              <View style={{ gap: space.xs, flex: 1 }}>
                {eyebrow ? (
                  <Txt kind="label" color="textMuted">
                    {eyebrow}
                  </Txt>
                ) : null}
                <Txt kind="title">{title}</Txt>
                {subtitle ? <Txt color="textSecondary">{subtitle}</Txt> : null}
              </View>
              {right}
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
      {/* Keeps scrolled content from running under the clock on full-screen pages. */}
      {variant === 'fullscreen' ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: colors.bg }} /> : null}
    </SafeAreaView>
  )
}
