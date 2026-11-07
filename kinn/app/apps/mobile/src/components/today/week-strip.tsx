import { router } from 'expo-router'
import { Pressable, View } from 'react-native'
import { addDays, morningMark, weekStartOf } from '@reco/core'
import type { MorningMark } from '@reco/core'

import { Txt } from '@/components/ui/txt'
import { weekdayLetter } from '@/format'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const MARK_COLOR: Readonly<Record<MorningMark, ColorToken | undefined>> = { clear: 'good', some: 'caution', flare: 'warn', none: undefined }
const DAYS_IN_WEEK = 7

/** Seven days with a dot for how each morning read. Past days open their detail. There is no count of days in a row, on purpose. */
export function WeekStrip() {
  const { today, state, view } = useStore()
  const colors = useColors()
  const start = weekStartOf(today)
  const flareDates = new Set(view.flares.map((f) => f.date))
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(start, i)).map((date) => {
        const isToday = date === today
        const isFuture = date > today
        const markColor = isFuture ? undefined : MARK_COLOR[morningMark(state.data, date, flareDates)]
        const fg = isToday ? 'onAccent' : isFuture ? 'textMuted' : 'text'
        return (
          <Pressable
            key={date}
            accessibilityRole="button"
            accessibilityLabel={date}
            disabled={isFuture}
            onPress={() => router.push({ pathname: '/day/[date]', params: { date } })}
            style={{ alignItems: 'center', gap: 4, paddingVertical: space.sm, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: isToday ? colors.accent : 'transparent' }}>
            <Txt kind="label" color={isToday ? 'onAccent' : 'textMuted'}>
              {weekdayLetter(date)}
            </Txt>
            <Txt kind="mono" color={fg} style={{ fontSize: 15, lineHeight: 20 }}>
              {Number(date.slice(8))}
            </Txt>
            <View style={{ width: 5, height: 5, borderRadius: radius.pill, backgroundColor: markColor ? colors[markColor] : 'transparent' }} />
          </Pressable>
        )
      })}
    </View>
  )
}
