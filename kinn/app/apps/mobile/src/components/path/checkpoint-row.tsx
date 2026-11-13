import { router } from 'expo-router'
import { Pressable, View } from 'react-native'
import type { CriterionView } from '@reco/core'

import { Txt } from '@/components/ui/txt'
import { pathCopy } from '@/copy-path'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const DOT = 10

const STATUS_COLOR: Readonly<Record<CriterionView['status'], ColorToken>> = { met: 'good', 'not-met': 'live', unknown: 'track' }

function Badge({ by }: { readonly by: CriterionView['criterion']['measuredBy'] }) {
  const colors = useColors()
  return (
    <View accessibilityLabel={pathCopy.byHint[by]} style={{ alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised }}>
      <Txt kind="label" color={by === 'tape' ? 'live' : 'textSecondary'}>
        {pathCopy.by[by]}
      </Txt>
    </View>
  )
}

/** Check-in metrics the person answers directly; swelling and reactions come from the check-in itself. */
const ASKED_DIRECTLY: ReadonlySet<string> = new Set(['instabilityEpisodes7d', 'runProgramDonePainFree'])

/** Where tapping a checkpoint goes: "You" opens its self-test, "PT" the PT sheet. */
function openFor(c: CriterionView): (() => void) | undefined {
  const { measuredBy, metric } = c.criterion
  if (measuredBy === 'pt') return () => router.push('/from-pt')
  if (measuredBy === 'self-test' || ASKED_DIRECTLY.has(metric)) return () => router.push({ pathname: '/self-test', params: { metric } })
  return undefined
}

export function CheckpointRow({ item, first }: { readonly item: CriterionView; readonly first: boolean }) {
  const colors = useColors()
  const onPress = openFor(item)
  const projection = item.blockedByLimit ? pathCopy.blocked : pathCopy.projection(item.projection)
  const body = (
    <View style={{ flexDirection: 'row', gap: space.md, paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: colors.border }}>
      <View style={{ width: DOT, height: DOT, marginTop: 7, borderRadius: radius.pill, backgroundColor: colors[STATUS_COLOR[item.status]] }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt kind="bodyStrong">{item.criterion.label}</Txt>
        <Txt kind="small" color="textSecondary">
          {pathCopy.value(item)}
        </Txt>
        {projection && item.status !== 'met' ? (
          <Txt kind="small" color={item.blockedByLimit ? 'caution' : 'textMuted'}>
            {projection}
          </Txt>
        ) : null}
      </View>
      <Badge by={item.criterion.measuredBy} />
    </View>
  )
  if (!onPress) return body
  return (
    <Pressable accessibilityRole="button" accessibilityHint={pathCopy.byHint[item.criterion.measuredBy]} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  )
}
