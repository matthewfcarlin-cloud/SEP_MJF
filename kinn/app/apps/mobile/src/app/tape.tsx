// Native placeholder for the tape screen. The browser build (tape.web.tsx) pairs the tape over
// Web Bluetooth today; the phone app gets native Bluetooth pairing next.
import { router } from 'expo-router'

import { copy } from '@/copy'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'

export default function TapeScreen() {
  const t = copy.tape
  return (
    <Screen variant="modal" title={t.title} subtitle={t.subtitle}>
      <Card>
        <SectionLabel>{t.pairTitle}</SectionLabel>
        <Txt color="textSecondary">{t.nativeSoon}</Txt>
      </Card>
      <Button label={copy.done} variant="ghost" onPress={() => router.back()} />
    </Screen>
  )
}
