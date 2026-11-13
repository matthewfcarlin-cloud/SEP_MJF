import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { Platform, View } from 'react-native'
import { DISCLAIMER, localDateKey } from '@reco/core'
import Constants from 'expo-constants'

import { SampleMenu } from '@/components/settings/sample-menu'
import { ChoiceCard, FieldEditor } from '@/components/setup/parts'
import type { Draft, DraftField } from '@/components/setup/parts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DateField } from '@/components/ui/date-field'
import { Field } from '@/components/ui/field'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { shortDate } from '@/format'
import { PRIVACY_URL } from '@/links'
import { ensureNotificationPermission } from '@/notifications'
import { useStore } from '@/store/provider'
import type { NotificationMode } from '@/store/state'
import { space } from '@/theme/tokens'

const NOTIFICATION_CHOICES: readonly NotificationMode[] = ['morning', 'morning-evening', 'visits', 'off']
const PROFILE_FIELDS: readonly { field: DraftField; label: string }[] = [
  { field: 'name', label: copy.settingsFlow.editName },
  { field: 'injury', label: copy.settingsFlow.editInjury },
  { field: 'injuryDate', label: copy.settingsFlow.editDate },
  { field: 'hadSurgery', label: copy.settingsFlow.editSurgery },
  { field: 'side', label: copy.settingsFlow.editSide },
  { field: 'sport', label: copy.settingsFlow.editSport },
]

type Open = 'comeback' | 'pt' | 'notifications' | undefined

function ComebackEditor() {
  const { state, updateProfile } = useStore()
  const { profile } = state.data
  const draft: Draft = {
    name: profile.name,
    injury: profile.injury,
    injuryDate: profile.injuryDate,
    hadSurgery: profile.hadSurgery,
    sport: profile.sport,
    ...(profile.side ? { side: profile.side } : {}),
  }
  return (
    <View style={{ gap: space.md, paddingBottom: space.sm }}>
      <Field label={copy.settingsFlow.editGoal} value={profile.goal} onChangeText={(goal) => updateProfile({ goal })} />
      {PROFILE_FIELDS.map(({ field, label }) => (
        <View key={field} style={{ gap: space.xs }}>
          <SectionLabel>{label}</SectionLabel>
          <FieldEditor field={field} draft={draft} onChange={(patch) => updateProfile(patch)} />
        </View>
      ))}
    </View>
  )
}

function PtEditor() {
  const { state, today, updateProfile } = useStore()
  const { profile } = state.data
  return (
    <View style={{ gap: space.md, paddingBottom: space.sm }}>
      <Field label={copy.setup.ptName} value={profile.ptName ?? ''} onChangeText={(ptName) => updateProfile({ ptName, hasPt: true })} placeholder={copy.setup.ptNamePlaceholder} autoCapitalize="words" />
      <Field label={copy.setup.ptEmail} value={profile.ptEmail ?? ''} onChangeText={(ptEmail) => updateProfile({ ptEmail })} placeholder={copy.setup.ptEmailPlaceholder} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <DateField label={copy.setup.ptVisit} value={profile.nextVisit} addLabel={copy.setup.ptVisitAdd} defaultDate={today} min={today} onChange={(nextVisit) => updateProfile({ nextVisit, hasPt: true })} />
      {profile.hasPt ? <Button label={copy.settingsFlow.removePt} variant="ghost" onPress={() => updateProfile({ hasPt: false })} /> : <Button label={copy.setup.ptYes} variant="secondary" onPress={() => updateProfile({ hasPt: true })} />}
    </View>
  )
}

function NotificationPicker() {
  const { real, setNotifications } = useStore()
  const [refused, setRefused] = useState(false)
  const pick = async (mode: NotificationMode) => {
    setNotifications(mode)
    setRefused(mode !== 'off' && !(await ensureNotificationPermission()))
  }
  return (
    <View style={{ gap: space.sm, paddingBottom: space.sm }}>
      {NOTIFICATION_CHOICES.map((n) => (
        <ChoiceCard key={n} title={copy.setup.notifOptions[n].title} sub={copy.setup.notifOptions[n].sub} selected={real.notifications === n} onPress={() => void pick(n)} />
      ))}
      {refused ? (
        <Txt kind="small" color="textSecondary">
          {copy.setup.notifRefused}
        </Txt>
      ) : null}
    </View>
  )
}

export default function SettingsScreen() {
  const { state, real, view, mode, setMode } = useStore()
  const { profile } = state.data
  const [open, setOpen] = useState<Open>(undefined)
  const toggle = (next: Open) => setOpen(open === next ? undefined : next)
  const injury = copy.setup.injuries[profile.injury as keyof typeof copy.setup.injuries] ?? copy.setup.injuries.other
  const isReal = mode === 'real'

  const switchMode = () => {
    setMode(isReal ? 'sample' : 'real')
    router.back()
  }

  return (
    <Screen variant="fullscreen" back={copy.settingsFlow.back} title={copy.settingsFlow.title}>
      <SampleMenu />
      <Card style={{ gap: 0 }}>
        <SectionLabel spaced>{copy.settingsFlow.comeback}</SectionLabel>
        <ListRow title={profile.goal || copy.settingsFlow.comeback} sub={copy.settingsFlow.comebackSub(injury, profile.side, profile.hadSurgery, view.weeksSinceInjury)} onPress={() => toggle('comeback')} />
        {open === 'comeback' ? <ComebackEditor /> : null}
        <ListRow title={copy.settingsFlow.yourPt} sub={profile.hasPt && profile.ptName ? copy.settingsFlow.ptSub(profile.ptName, profile.nextVisit ? shortDate(profile.nextVisit) : undefined) : copy.settingsFlow.ptNone} onPress={() => toggle('pt')} />
        {open === 'pt' ? <PtEditor /> : null}
      </Card>

      <Card>
        <SectionLabel>{copy.settingsFlow.whatRecoDoes}</SectionLabel>
        <Txt>{copy.settingsFlow.guidance[state.guidance]}</Txt>
        <Txt kind="small" color="textMuted">
          {copy.inDevelopment}
        </Txt>
      </Card>

      {isReal ? (
        <Card style={{ gap: 0 }}>
          <SectionLabel spaced>{copy.settingsFlow.notifications}</SectionLabel>
          <ListRow title={copy.setup.notifOptions[real.notifications].title} sub={copy.setup.notifOptions[real.notifications].sub} onPress={() => toggle('notifications')} />
          {open === 'notifications' ? <NotificationPicker /> : null}
        </Card>
      ) : null}

      <Card style={{ gap: 0 }}>
        <SectionLabel spaced>{copy.settingsFlow.voice}</SectionLabel>
        <ListRow title={copy.settingsFlow.voiceTitle} sub={copy.settingsFlow.voiceBody} />
      </Card>

      <Card style={{ gap: 0 }}>
        <SectionLabel spaced>{copy.settingsFlow.yourData}</SectionLabel>
        {isReal ? <ListRow title={copy.settingsFlow.export} sub={real.lastExportAt ? copy.settingsFlow.exportLast(shortDate(localDateKey(real.lastExportAt))) : copy.settingsFlow.exportNever} onPress={() => router.push('/backup')} /> : null}
        {Platform.OS === 'web' ? null : <ListRow title={isReal ? copy.settingsFlow.sample : copy.settingsFlow.sampleBack} sub={isReal ? copy.settingsFlow.sampleSub : copy.settingsFlow.sampleBackSub} onPress={switchMode} />}
        <ListRow title={copy.settingsFlow.privacy} sub={copy.settingsFlow.privacySub} onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)} />
        {isReal ? <ListRow title={copy.settingsFlow.delete} sub={copy.settingsFlow.deleteSub} onPress={() => router.push('/delete')} /> : null}
      </Card>

      <Txt kind="small" color="textMuted">
        {DISCLAIMER}
      </Txt>
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {copy.settingsFlow.version(Constants.expoConfig?.version ?? '')}
      </Txt>
    </Screen>
  )
}
