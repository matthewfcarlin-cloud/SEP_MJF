import { Redirect, router } from 'expo-router'
import { View } from 'react-native'

import { CheckpointRow } from '@/components/path/checkpoint-row'
import { LimitBanner } from '@/components/path/limit-banner'
import { PathHero } from '@/components/path/path-hero'
import { PhaseTimeline } from '@/components/path/phase-timeline'
import { PathSources } from '@/components/path/sources'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { pathCopy } from '@/copy-path'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'

function OtherKneeCard() {
  return (
    <Card index={1}>
      <Txt kind="bodyStrong">{pathCopy.otherKneeTitle}</Txt>
      <Txt kind="small" color="textSecondary">
        {pathCopy.otherKneeBody}
      </Txt>
      <Button label={pathCopy.otherKneeAction} variant="secondary" onPress={() => router.push({ pathname: '/measure', params: { knee: 'other' } })} />
    </Card>
  )
}

/**
 * Where you are on the criterion-based protocol: checkpoints met for this phase, who
 * measures each one, the bend limit in force, and every phase with its typical weeks.
 */
export default function PathScreen() {
  const { view, state, mode, today } = useStore()
  const path = view.path
  if (!path) return <Redirect href="/(tabs)/progress" />
  return (
    <Screen variant="fullscreen" back={pathCopy.back} title={pathCopy.title} subtitle={path.protocol.name}>
      {mode === 'sample' ? <SampleTag /> : null}
      <Card index={0}>
        <PathHero path={path} />
      </Card>
      <LimitBanner limits={path.limits} alerts={state.data.bendAlerts ?? []} today={today} tapeReady={state.data.bendCalibration !== undefined} />
      {state.data.profile.otherKnee ? null : <OtherKneeCard />}
      <Card index={2} style={{ gap: 0 }}>
        <SectionLabel spaced>{pathCopy.checkpoints}</SectionLabel>
        {path.criteria.map((c, i) => (
          <CheckpointRow key={c.criterion.id} item={c} first={i === 0} />
        ))}
        <View style={{ paddingTop: space.sm }}>
          <Button label={pathCopy.fromPt} variant="secondary" onPress={() => router.push('/from-pt')} />
        </View>
      </Card>
      <Card index={3}>
        <SectionLabel>{pathCopy.unlocks}</SectionLabel>
        {path.phase.unlocks.map((u) => (
          <Txt key={u} kind="small" color="textSecondary">{`· ${u}`}</Txt>
        ))}
      </Card>
      <PhaseTimeline path={path} surgeryDate={state.data.profile.injuryDate} index={4} />
      <PathSources path={path} />
    </Screen>
  )
}
