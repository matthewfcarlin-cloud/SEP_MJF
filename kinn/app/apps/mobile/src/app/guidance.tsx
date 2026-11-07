import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import type { GuidanceLevel } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'

const LEVELS: readonly GuidanceLevel[] = ['descriptive', 'pt-led', 'guided']
const isLevel = (x: unknown): x is GuidanceLevel => LEVELS.includes(x as GuidanceLevel)

/**
 * Team only: the level changes through a link (reco://guidance?level=pt-led), never in the app's own
 * screens, because PT-led needs the PT's agreement and Guided needs regulatory review first.
 */
export default function GuidanceLink() {
  const { level } = useLocalSearchParams<{ level?: string }>()
  const { setGuidance } = useStore()
  const valid = isLevel(level)
  useEffect(() => {
    if (isLevel(level)) setGuidance(level)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applied once when the link opens
  }, [level])
  return (
    <Screen variant="modal" title={copy.guidanceLink.title}>
      <Txt>{valid ? copy.guidanceLink.set(copy.guidanceLink.names[level]) : copy.guidanceLink.unknown}</Txt>
      <Button label={copy.done} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
    </Screen>
  )
}
