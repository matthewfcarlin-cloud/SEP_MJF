import { router } from 'expo-router'
import { Switch, View } from 'react-native'
import { DISCLAIMER } from '@kinn/core'

import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { Txt } from '@/components/ui/txt'
import { space } from '@/theme/tokens'

export default function SettingsScreen() {
  const { state, setPtReminder, resetToSample, restartOnboarding } = useStore()
  return (
    <Screen variant="modal" title={copy.settings.title}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Txt kind="bodyStrong">{copy.settings.ptReminder}</Txt>
            <Txt kind="small" color="textSecondary">
              {copy.settings.ptReminderBody}
            </Txt>
          </View>
          <Switch value={state.ptReminder} onValueChange={setPtReminder} />
        </View>
      </Card>
      <Button
        label={copy.settings.resetSample}
        variant="secondary"
        onPress={() => {
          resetToSample()
          router.back()
        }}
      />
      <Button
        label={copy.settings.startOver}
        variant="ghost"
        onPress={() => {
          restartOnboarding()
          router.replace('/onboarding')
        }}
      />
      <Txt kind="small" color="textMuted">
        {DISCLAIMER}
      </Txt>
    </Screen>
  )
}
