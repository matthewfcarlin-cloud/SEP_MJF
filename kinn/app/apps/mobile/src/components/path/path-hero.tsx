import { View } from 'react-native'
import type { PathState, PathView } from '@reco/core'

import { Ring } from '@/components/ring'
import { Txt } from '@/components/ui/txt'
import { pathCopy } from '@/copy-path'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const RING_SIZE = 112
const RING_STROKE = 8
const SMALL_RING_SIZE = 64
const SMALL_RING_STROKE = 5
const FULL = 100

/** working is live teal, ready and complete good, behind-typical a hold, needs-pt a note. */
export const PATH_STATE_COLOR: Readonly<Record<PathState, ColorToken>> = {
  working: 'live',
  'ready-waiting-on-time': 'good',
  ready: 'good',
  complete: 'good',
  'behind-typical': 'caution',
  'needs-pt': 'textMuted',
}

export function PathStatePill({ state }: { readonly state: PathState }) {
  const colors = useColors()
  const tone = colors[PATH_STATE_COLOR[state]]
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: `${tone}2E` }}>
      <View style={{ width: 8, height: 8, borderRadius: radius.pill, backgroundColor: tone }} />
      <Txt kind="small">{pathCopy.state[state]}</Txt>
    </View>
  )
}

export function PathRing({ path, small = false }: { readonly path: PathView; readonly small?: boolean }) {
  const size = small ? SMALL_RING_SIZE : RING_SIZE
  const value = path.requiredCount ? (path.metCount / path.requiredCount) * FULL : 0
  return (
    <View accessibilityRole="image" accessibilityLabel={pathCopy.ringLabel(path.metCount, path.requiredCount)} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute' }}>
        <Ring value={value} color="live" size={size} stroke={small ? SMALL_RING_STROKE : RING_STROKE} sweep={!small} />
      </View>
      <Txt kind="mono">{pathCopy.ringCenter(path.metCount, path.requiredCount)}</Txt>
    </View>
  )
}

/** Ring, phase, headline, state and why: the top of the Path screen. */
export function PathHero({ path, small = false }: { readonly path: PathView; readonly small?: boolean }) {
  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <PathRing path={path} small={small} />
        <View style={{ flex: 1, gap: space.xs }}>
          <Txt kind="label" color="textMuted">
            {`${pathCopy.phaseOf(path.phase.n, path.protocol.phases.length)} · ${pathCopy.weekIn(path.weeksIn)}`}
          </Txt>
          <Txt kind={small ? 'bodyStrong' : 'heading'}>{path.headline}</Txt>
          <PathStatePill state={path.state} />
        </View>
      </View>
      <Txt color="textSecondary" kind={small ? 'small' : 'body'}>
        {path.why}
      </Txt>
    </View>
  )
}
