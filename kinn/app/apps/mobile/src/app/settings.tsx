import { router } from 'expo-router'
import { Switch, View } from 'react-native'
import { DISCLAIMER, SEED_DAYS } from '@reco/core'

import { copy } from '@/copy'
import { shortDate } from '@/format'
import { useStore } from '@/store/provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SampleTag } from '@/components/ui/sample-tag'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { space } from '@/theme/tokens'

export default function SettingsScreen() {
  const { state, view, setPtReminder, resetToSample, restartOnboarding } = useStore()
  const { profile } = state.data
  const facts = [
    copy.settings.profileInjury[profile.injury],
    profile.hadSurgery ? copy.settings.profileSurgery.yes : copy.settings.profileSurgery.no,
    profile.sport,
    profile.hasPt ? copy.settings.profilePt.yes : copy.settings.profilePt.no,
  ].join(' · ')

  const startOver = () => {
    restartOnboarding()
    router.replace('/onboarding')
  }

  return (
    <Screen variant="modal" title={copy.settings.title}>
      <Card index={0}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{copy.settings.profileTitle}</SectionLabel>
          <Button label={copy.settings.profileEdit} variant="ghost" onPress={startOver} style={{ paddingVertical: 4, paddingHorizontal: space.sm }} />
        </View>
        <Txt kind="heading">{profile.name && profile.name !== 'there' ? `${profile.name} · ${profile.goal}` : profile.goal}</Txt>
        <Txt color="textSecondary">{facts}</Txt>
        <Txt kind="small" color="textMuted">
          {copy.today.weekLabel(view.weeksSinceInjury)} · since {shortDate(profile.injuryDate)}
        </Txt>
      </Card>

      <Card index={1}>
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

      <Card index={2}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{copy.settings.dataTitle}</SectionLabel>
          <SampleTag />
        </View>
        <Txt kind="small" color="textSecondary">
          {copy.settings.sampleBody(SEED_DAYS)}
        </Txt>
        <Txt kind="small" color="textSecondary">
          {copy.settings.dataBody}
        </Txt>
        <Button label={copy.settings.resetSample} variant="secondary" onPress={() => { resetToSample(); router.back() }} />
      </Card>

      <Button label={copy.settings.startOver} variant="ghost" onPress={startOver} />
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {copy.settings.appVersion}
      </Txt>
      <Txt kind="small" color="textMuted">
        {DISCLAIMER}
      </Txt>
    </Screen>
  )
}
