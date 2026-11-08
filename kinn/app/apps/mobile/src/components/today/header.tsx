import { Link } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useState } from 'react'
import { Pressable, View } from 'react-native'

import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

/** Greeting and settings. The week strip under it already says the date. */
export function TodayHeader() {
  const { view, state } = useStore()
  const colors = useColors()
  const { profile } = state.data
  const [hour] = useState(() => new Date().getHours())
  const week = view.firstDay ? copy.today.dayOne : copy.today.weekLabel(view.weeksSinceInjury)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt kind="title" style={{ fontSize: 24, lineHeight: 30 }}>
          {copy.today.timeGreeting(hour, profile.name)}
        </Txt>
        <Txt kind="small" color="textSecondary">
          {profile.goal ? `${week} · ${profile.goal}` : week}
        </Txt>
      </View>
      <Link href="/settings" asChild>
        <Pressable accessibilityRole="button" accessibilityLabel={copy.settings.title} hitSlop={12}>
          <View style={{ width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <SymbolView name="gearshape" size={18} tintColor={colors.textSecondary} />
          </View>
        </Pressable>
      </Link>
    </View>
  )
}
