import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { pathCopy } from '@/copy-path'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'

const WEEK_MS = 7 * 24 * 3600_000

/** Never guilt: an offer to catch up, or to start from today. */
export function QuietCard() {
  const { view, today } = useStore()
  const [dismissed, setDismissed] = useState(false)
  if (!view.quiet || dismissed) return null
  return (
    <Card>
      <Txt kind="bodyStrong">{copy.read.quietTitle}</Txt>
      <Txt kind="small" color="textSecondary">
        {copy.read.quietBody}
      </Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button label={copy.read.quietCatchUp} onPress={() => router.push({ pathname: '/add-day', params: { date: today } })} style={{ flex: 1 }} />
        <Button label={copy.read.quietStart} variant="secondary" onPress={() => setDismissed(true)} style={{ flex: 1 }} />
      </View>
    </Card>
  )
}

/** Data only lives on the phone during the pilot, so a week without an export earns one gentle card. */
export function BackupCard() {
  const { mode, state, view } = useStore()
  const [now] = useState(() => Date.now())
  if (mode !== 'real' || state.consentAt === undefined) return null
  const lastTouched = Math.max(state.lastExportAt ?? state.consentAt, state.backupDismissedAt ?? 0)
  if (view.quiet || now - lastTouched < WEEK_MS) return null
  return (
    <Card>
      <Txt kind="bodyStrong">{copy.read.backupTitle}</Txt>
      <Txt kind="small" color="textSecondary">
        {copy.read.backupBody}
      </Txt>
      <Button label={copy.read.backupOpen} variant="secondary" onPress={() => router.push('/backup')} />
    </Card>
  )
}

/** Bends past the limit today. Sample data until the tape's bend reading is in degrees. */
export function BendAlertCard() {
  const { view } = useStore()
  const limit = view.path?.limits.flexionMaxDeg
  if (view.bendAlertsToday === 0 || limit === null || limit === undefined) return null
  return (
    <Card>
      <Txt kind="bodyStrong">{pathCopy.alertsToday(view.bendAlertsToday, limit)}</Txt>
      <Txt kind="small" color="textSecondary">
        {pathCopy.alertsTodaySub}
      </Txt>
      <Button label={pathCopy.cardOpen} variant="secondary" onPress={() => router.push('/path')} />
    </Card>
  )
}
