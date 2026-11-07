import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { saveExport, sendExportToTeam } from '@/export'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export default function BackupSheet() {
  const { state, today, markExported, dismissBackup } = useStore()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const run = async (action: typeof saveExport) => {
    setBusy(true)
    setFailed(false)
    try {
      await action(state, today)
      markExported()
      router.back()
    } catch (error) {
      console.warn('RECO: export did not complete.', error)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={{ backgroundColor: colors.bg, padding: space.md, paddingTop: space.lg, paddingBottom: insets.bottom + space.md, gap: space.sm }}>
      <SectionLabel>{copy.backup.eyebrow}</SectionLabel>
      <Txt kind="title" style={{ fontSize: 24, lineHeight: 30 }}>
        {copy.backup.title}
      </Txt>
      <Txt color="textSecondary">{copy.backup.body}</Txt>
      <Txt kind="small" color={failed ? 'warn' : 'textMuted'} style={{ marginBottom: space.sm }}>
        {failed ? copy.backup.failed : copy.backup.privateNote}
      </Txt>
      <Button label={copy.backup.save} disabled={busy} onPress={() => void run(saveExport)} />
      <Button label={copy.backup.send} variant="secondary" disabled={busy} onPress={() => void run(sendExportToTeam)} />
      <Button
        label={copy.backup.notNow}
        variant="ghost"
        onPress={() => {
          dismissBackup()
          router.back()
        }}
      />
    </View>
  )
}
