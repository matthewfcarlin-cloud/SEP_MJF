import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { Linking, View } from 'react-native'
import { addDays, parseIntake, startOfDay, weeksSince } from '@reco/core'
import type { Injury, PlanExercise, Profile } from '@reco/core'

import { ExerciseForm } from '@/components/plan/exercise-form'
import { ChoiceCard, DRAFT_FIELDS, FieldEditor, REQUIRED_FIELDS, fieldLabel, fieldQuestion, fieldValue } from '@/components/setup/parts'
import type { Draft, DraftField } from '@/components/setup/parts'
import { RangeFields, parseRange } from '@/components/setup/range-fields'
import type { RangeText } from '@/components/setup/range-fields'
import { VoiceBox } from '@/components/setup/voice-box'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckRow } from '@/components/ui/check'
import { Chip, ChipRow } from '@/components/ui/chip'
import { DateField } from '@/components/ui/date-field'
import { Field } from '@/components/ui/field'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { shortDate } from '@/format'
import { FIND_PT_URL, PRIVACY_URL, waitlistMailto } from '@/links'
import { ensureNotificationPermission } from '@/notifications'
import { useStore } from '@/store/provider'
import type { NotificationMode } from '@/store/state'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

type Step = 'welcome' | 'consent' | 'under18' | 'tell' | 'not-knee' | 'heard' | 'gap' | 'pt-fork' | 'pt-details' | 'exercise' | 'no-pt' | 'goal' | 'range' | 'notifications'

const WEEKS_PER_MONTH_3 = 12
const NOTIFICATION_CHOICES: readonly NotificationMode[] = ['morning', 'morning-evening', 'visits', 'off']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DAYS_PER_WEEK = 7

const isMissing = (draft: Draft, f: DraftField): boolean => draft[f] === undefined || draft[f] === ''

function toDraft(text: string, today: string): Draft {
  const found = parseIntake(text)
  const knee: readonly Injury[] = ['acl', 'meniscus', 'other']
  return {
    ...(found.injury && knee.includes(found.injury) ? { injury: found.injury } : {}),
    ...(found.weeksAgo !== undefined ? { injuryDate: addDays(today, -Math.round(found.weeksAgo * DAYS_PER_WEEK)) } : {}),
    ...(found.hadSurgery !== undefined ? { hadSurgery: found.hadSurgery } : {}),
    ...(found.side ? { side: found.side } : {}),
    ...(found.sport ? { sport: found.sport } : {}),
  }
}

function Bottom({ children }: { readonly children: React.ReactNode }) {
  return <View style={{ gap: space.sm, marginTop: space.md }}>{children}</View>
}

export default function OnboardingScreen() {
  const { completeOnboarding, setMode, today } = useStore()
  const colors = useColors()
  const [step, setStep] = useState<Step>('welcome')
  const [isAdult, setIsAdult] = useState(false)
  const [understands, setUnderstands] = useState(false)
  const [consentAt, setConsentAt] = useState<number | undefined>(undefined)
  const [story, setStory] = useState('')
  const [draft, setDraft] = useState<Draft>({})
  const [editing, setEditing] = useState<DraftField | undefined>(undefined)
  const [gaps, setGaps] = useState<readonly DraftField[]>([])
  const [hasPt, setHasPt] = useState(false)
  const [ptName, setPtName] = useState('')
  const [ptEmail, setPtEmail] = useState('')
  const [nextVisit, setNextVisit] = useState<string | undefined>(undefined)
  const [exercises, setExercises] = useState<readonly PlanExercise[]>([])
  const [goalChoice, setGoalChoice] = useState<string | undefined>(undefined)
  const [goalText, setGoalText] = useState('')
  const [range, setRange] = useState<RangeText>({ bend: '', straighten: '' })
  const [notifications, setNotifications] = useState<NotificationMode>('morning')
  const [notifRefused, setNotifRefused] = useState(false)

  const patchDraft = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch })

  const afterTell = () => {
    const found = parseIntake(story)
    if (found.joint && found.joint !== 'knee') {
      setStep('not-knee')
      return
    }
    setDraft({ ...draft, ...toDraft(story, today) })
    setStep('heard')
  }

  const afterHeard = () => {
    const missing = REQUIRED_FIELDS.filter((f) => isMissing(draft, f))
    setGaps(missing)
    setStep(missing.length ? 'gap' : 'pt-fork')
  }

  const answerQuestions = () => {
    setGaps(DRAFT_FIELDS.filter((f) => isMissing(draft, f)))
    setStep('gap')
  }

  const afterGap = () => {
    const rest = gaps.slice(1)
    setGaps(rest)
    if (rest.length === 0) setStep('pt-fork')
  }

  const goalOptions = copy.setup.goalChips(draft.sport && draft.sport !== 'Other' ? draft.sport : '')
  const goal = goalChoice === copy.setup.goalOther ? goalText.trim() : goalChoice ?? ''

  const finish = async () => {
    if (notifications !== 'off') setNotifRefused(!(await ensureNotificationPermission()))
    const emailOk = EMAIL.test(ptEmail.trim())
    const profile: Profile = {
      name: draft.name?.trim() ?? '',
      joint: 'knee',
      injury: draft.injury ?? 'other',
      injuryDate: draft.injuryDate ?? today,
      hadSurgery: draft.hadSurgery ?? false,
      sport: draft.sport ?? '',
      hasPt,
      goal,
      ...(draft.side ? { side: draft.side } : {}),
      ...(story.trim() ? { story: story.trim() } : {}),
      ...(hasPt && ptName.trim() ? { ptName: ptName.trim() } : {}),
      ...(hasPt && emailOk ? { ptEmail: ptEmail.trim() } : {}),
      ...(hasPt && nextVisit ? { nextVisit } : {}),
    }
    const rom = parseRange(range, today, hasPt ? 'pt' : 'self')
    completeOnboarding({ profile, notifications, consentAt: consentAt ?? Date.now(), exercises, ...(rom ? { rom } : {}) })
    router.replace('/')
  }

  const lookAround = () => {
    setMode('sample')
    router.replace('/')
  }

  switch (step) {
    case 'welcome':
      return (
        <Screen variant="fullscreen">
          <View style={{ marginTop: 160, gap: space.sm, marginBottom: space.xxl }}>
            <Txt kind="label" color="textMuted">
              {copy.appName}
            </Txt>
            <Txt kind="serif" style={{ fontSize: 52, lineHeight: 56 }}>
              {copy.setup.welcomeTagline}
            </Txt>
            <Txt color="textSecondary">{copy.setup.welcomeBody}</Txt>
          </View>
          <Button label={copy.setup.getStarted} onPress={() => setStep('consent')} />
          <Button label={copy.setup.lookAround} variant="ghost" onPress={lookAround} />
        </Screen>
      )
    case 'consent':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.consentEyebrow} title={copy.setup.consentTitle}>
          <Card>
            {copy.setup.consentPoints.map((p) => (
              <View key={p.title} style={{ gap: 2, paddingVertical: space.xs }}>
                <Txt kind="bodyStrong">{p.title}</Txt>
                <Txt kind="small" color="textSecondary">
                  {p.body}
                </Txt>
              </View>
            ))}
          </Card>
          <Card style={{ gap: 0 }}>
            <CheckRow label={copy.setup.adult} checked={isAdult} onPress={() => setIsAdult(!isAdult)} />
            <CheckRow label={copy.setup.understand} checked={understands} onPress={() => setUnderstands(!understands)} />
          </Card>
          <Bottom>
            <Button
              label={copy.setup.agree}
              disabled={!isAdult || !understands}
              onPress={() => {
                setConsentAt(Date.now())
                setStep('tell')
              }}
            />
            <Button label={copy.setup.privacy} variant="ghost" onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)} />
            <Button label={copy.setup.under18} variant="ghost" onPress={() => setStep('under18')} />
          </Bottom>
        </Screen>
      )
    case 'under18':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.under18Eyebrow} title={copy.setup.under18Title} subtitle={copy.setup.under18Body}>
          <Bottom>
            <Button label={copy.setup.back} variant="secondary" onPress={() => setStep('consent')} />
          </Bottom>
        </Screen>
      )
    case 'tell':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.tellEyebrow} title={copy.setup.tellTitle} subtitle={copy.setup.tellBody}>
          <VoiceBox value={story} onChange={setStory} placeholder={copy.setup.tellPlaceholder} />
          <Txt kind="small" color="textMuted">
            {copy.setup.tellPrivacy}
          </Txt>
          <Bottom>
            <Button label={copy.setup.next} disabled={!story.trim()} onPress={afterTell} />
            <Button label={copy.setup.answerInstead} variant="ghost" onPress={answerQuestions} />
          </Bottom>
        </Screen>
      )
    case 'not-knee':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.notKneeEyebrow} title={copy.setup.notKneeTitle} subtitle={copy.setup.notKneeBody}>
          <Bottom>
            <Button label={copy.setup.notKneeWaitlist} onPress={() => void Linking.openURL(waitlistMailto(copy.setup.waitlistSubject))} />
            <Button
              label={copy.setup.notKneeBack}
              variant="secondary"
              onPress={() => {
                setDraft({ ...draft, ...toDraft(story, today) })
                setStep('heard')
              }}
            />
          </Bottom>
        </Screen>
      )
    case 'heard': {
      const weeksIn = draft.injuryDate ? weeksSince(draft.injuryDate, startOfDay(today, 12)) : undefined
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.heardEyebrow} title={copy.setup.heardTitle} subtitle={copy.setup.heardBody}>
          <Card style={{ gap: 0 }}>
            {DRAFT_FIELDS.map((f, i) => (
              <View key={f}>
                <ListRow first={i === 0} title={fieldLabel(f)} sub={fieldValue(draft, f, shortDate) ?? copy.setup.notFound} onPress={() => setEditing(editing === f ? undefined : f)} right={<Txt kind="small" color="textSecondary">{copy.setup.change}</Txt>} />
                {editing === f ? (
                  <View style={{ paddingBottom: space.sm }}>
                    <FieldEditor field={f} draft={draft} onChange={patchDraft} />
                  </View>
                ) : null}
              </View>
            ))}
          </Card>
          {weeksIn !== undefined && weeksIn < WEEKS_PER_MONTH_3 ? (
            <Txt kind="small" color="textSecondary">
              {copy.setup.earlyNote}
            </Txt>
          ) : null}
          <Bottom>
            <Button label={copy.setup.next} onPress={afterHeard} />
            <Button label={copy.setup.back} variant="ghost" onPress={() => setStep('tell')} />
          </Bottom>
        </Screen>
      )
    }
    case 'gap': {
      const field = gaps[0]
      if (!field) return null
      const optional = !REQUIRED_FIELDS.includes(field)
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.heardEyebrow} title={fieldQuestion(field)}>
          <FieldEditor field={field} draft={draft} onChange={patchDraft} />
          <Bottom>
            <Button label={copy.setup.next} disabled={!optional && isMissing(draft, field)} onPress={afterGap} />
            {optional ? <Button label={copy.setup.skip} variant="ghost" onPress={afterGap} /> : null}
          </Bottom>
        </Screen>
      )
    }
    case 'pt-fork':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.ptEyebrow} title={copy.setup.ptTitle} subtitle={copy.setup.ptBody}>
          <ChoiceCard
            title={copy.setup.ptYes}
            sub={copy.setup.ptYesSub}
            onPress={() => {
              setHasPt(true)
              setStep('pt-details')
            }}
          />
          <ChoiceCard
            title={copy.setup.ptNo}
            sub={copy.setup.ptNoSub}
            onPress={() => {
              setHasPt(false)
              setStep('no-pt')
            }}
          />
        </Screen>
      )
    case 'pt-details': {
      const badEmail = ptEmail.trim() !== '' && !EMAIL.test(ptEmail.trim())
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.ptEyebrow} title={copy.setup.ptDetailsTitle}>
          <Field label={copy.setup.ptName} value={ptName} onChangeText={setPtName} placeholder={copy.setup.ptNamePlaceholder} autoCapitalize="words" />
          <Field label={copy.setup.ptEmail} value={ptEmail} onChangeText={setPtEmail} placeholder={copy.setup.ptEmailPlaceholder} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          {badEmail ? (
            <Txt kind="small" color="warn">
              {copy.setup.ptEmailInvalid}
            </Txt>
          ) : null}
          <DateField label={copy.setup.ptVisit} value={nextVisit} addLabel={copy.setup.ptVisitAdd} defaultDate={addDays(today, DAYS_PER_WEEK)} min={today} onChange={setNextVisit} />
          <ChoiceCard title={copy.setup.addExercises} sub={exercises.length ? copy.setup.exercisesAdded(exercises.length) : copy.setup.addExercisesSub} onPress={() => setStep('exercise')} />
          <Txt kind="small" color="textMuted">
            {copy.setup.ptNothingSent}
          </Txt>
          <Bottom>
            <Button label={copy.setup.next} disabled={badEmail} onPress={() => setStep('goal')} />
            <Button label={copy.setup.back} variant="ghost" onPress={() => setStep('pt-fork')} />
          </Bottom>
        </Screen>
      )
    }
    case 'exercise':
      return (
        <Screen variant="fullscreen" eyebrow={copy.plan.exercise.eyebrow} title={copy.plan.exercise.addTitle}>
          <ExerciseForm
            key={exercises.length}
            onSave={(d) => {
              setExercises([...exercises, { ...d, id: `ex-${Date.now().toString(36)}-${exercises.length}` }])
              setStep('pt-details')
            }}
          />
          <Button label={copy.setup.back} variant="ghost" onPress={() => setStep('pt-details')} />
        </Screen>
      )
    case 'no-pt':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.noPtEyebrow} title={copy.setup.noPtTitle}>
          <Card>
            <SectionLabel>{copy.setup.willLabel}</SectionLabel>
            {copy.setup.will.map((w) => (
              <View key={w} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <SymbolView name="checkmark" size={13} tintColor={colors.text} />
                <Txt kind="small">{w}</Txt>
              </View>
            ))}
          </Card>
          <Card>
            <SectionLabel>{copy.setup.wontLabel}</SectionLabel>
            {copy.setup.wont.map((w) => (
              <View key={w} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <SymbolView name="minus" size={13} tintColor={colors.textMuted} />
                <Txt kind="small" color="textSecondary">
                  {w}
                </Txt>
              </View>
            ))}
          </Card>
          <Bottom>
            <Button label={copy.setup.next} onPress={() => setStep('goal')} />
            <Button label={copy.setup.findPt} variant="ghost" onPress={() => void WebBrowser.openBrowserAsync(FIND_PT_URL)} />
          </Bottom>
        </Screen>
      )
    case 'goal':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.goalEyebrow} title={copy.setup.goalTitle} subtitle={copy.setup.goalBody}>
          <ChipRow>
            {[...goalOptions, copy.setup.goalOther].map((g) => (
              <Chip key={g} label={g} selected={goalChoice === g} onPress={() => setGoalChoice(g)} />
            ))}
          </ChipRow>
          {goalChoice === copy.setup.goalOther ? <Field value={goalText} onChangeText={setGoalText} placeholder={copy.setup.goalPlaceholder} autoFocus /> : null}
          <Bottom>
            <Button label={copy.setup.next} disabled={!goal} onPress={() => setStep('range')} />
          </Bottom>
        </Screen>
      )
    case 'range': {
      const anyTyped = range.bend.trim() !== '' || range.straighten.trim() !== ''
      const invalid = anyTyped && parseRange(range, today, 'self') === undefined
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.rangeEyebrow} title={copy.setup.rangeTitle} subtitle={copy.setup.rangeBody}>
          <RangeFields value={range} onChange={setRange} />
          {invalid ? (
            <Txt kind="small" color="warn">
              {copy.measure.invalid}
            </Txt>
          ) : null}
          <Bottom>
            <Button label={copy.setup.next} disabled={!anyTyped || invalid} onPress={() => setStep('notifications')} />
            <Button
              label={copy.setup.skip}
              variant="ghost"
              onPress={() => {
                setRange({ bend: '', straighten: '' })
                setStep('notifications')
              }}
            />
          </Bottom>
        </Screen>
      )
    }
    case 'notifications':
      return (
        <Screen variant="fullscreen" eyebrow={copy.setup.notifEyebrow} title={copy.setup.notifTitle} subtitle={copy.setup.notifBody}>
          {NOTIFICATION_CHOICES.map((n) => (
            <ChoiceCard key={n} title={copy.setup.notifOptions[n].title} sub={copy.setup.notifOptions[n].sub} selected={notifications === n} onPress={() => setNotifications(n)} />
          ))}
          {notifRefused ? (
            <Txt kind="small" color="textSecondary">
              {copy.setup.notifRefused}
            </Txt>
          ) : null}
          <Bottom>
            <Button label={copy.setup.finish} onPress={() => void finish()} />
          </Bottom>
        </Screen>
      )
  }
}
