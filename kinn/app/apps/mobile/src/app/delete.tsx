import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { deleteServerCopy, useStore } from '@/store/provider'
import { clearToken } from '@/sync/session'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export default function DeleteSheet() {
  const { deleteMyData, real } = useStore()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const shared = real.sync !== undefined
  const [busy, setBusy] = useState(false)
  const [serverFailed, setServerFailed] = useState(false)

  const wipePhone = () => {
    deleteMyData()
    router.dismissAll()
    router.replace('/onboarding')
  }
  // With sharing on, the server copy goes first: if it can't be reached the person is told, not left guessing.
  const confirm = async () => {
    if (!shared) return wipePhone()
    setBusy(true)
    const gone = await deleteServerCopy()
    setBusy(false)
    if (gone) wipePhone()
    else setServerFailed(true)
  }
  const phoneOnly = async () => {
    if (busy) return
    setBusy(true)
    try {
      await clearToken()
    } catch (error) {
      // The record on the phone is what was asked for; a session the Keychain won't release ends on the server by itself.
      console.warn('RECO: the session could not be cleared from the Keychain.', error)
    }
    wipePhone()
  }
  return (
    <View style={{ backgroundColor: colors.bg, padding: space.md, paddingTop: space.lg, paddingBottom: insets.bottom + space.md, gap: space.sm }}>
      <SectionLabel>{copy.deleteData.eyebrow}</SectionLabel>
      <Txt kind="title" style={{ fontSize: 24, lineHeight: 30 }}>
        {copy.deleteData.title}
      </Txt>
      <Txt color="textSecondary" style={{ marginBottom: shared ? 0 : space.sm }}>
        {copy.deleteData.body}
      </Txt>
      {shared ? (
        <Txt color={serverFailed ? 'warn' : 'textSecondary'} style={{ marginBottom: space.sm }}>
          {serverFailed ? copy.deleteData.serverFailed : copy.deleteData.serverToo}
        </Txt>
      ) : null}
      <Button label={copy.deleteData.exportFirst} onPress={() => router.replace('/backup')} disabled={busy} />
      <Button label={serverFailed ? copy.deleteData.tryAgain : copy.deleteData.confirm} variant="secondary" labelColor="warn" onPress={() => void confirm()} disabled={busy} />
      {serverFailed ? <Button label={copy.deleteData.phoneOnly} variant="secondary" onPress={() => void phoneOnly()} disabled={busy} /> : null}
      <Button label={copy.deleteData.cancel} variant="ghost" onPress={() => router.back()} disabled={busy} />
    </View>
  )
}
