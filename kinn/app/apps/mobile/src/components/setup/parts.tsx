import { SymbolView } from 'expo-symbols'
import { Pressable, View } from 'react-native'
import type { Injury, Side } from '@reco/core'

import { Chip, ChipRow } from '@/components/ui/chip'
import { DateField } from '@/components/ui/date-field'
import { Field } from '@/components/ui/field'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

/** The fields of a person's comeback, while they are still being filled in. */
export interface Draft {
  readonly name?: string
  readonly injury?: Injury
  readonly injuryDate?: string
  readonly hadSurgery?: boolean
  readonly side?: Side
  readonly sport?: string
}

export type DraftField = keyof Draft

export const DRAFT_FIELDS: readonly DraftField[] = ['name', 'injury', 'injuryDate', 'hadSurgery', 'side', 'sport']
/** Name and sport can stay empty; these are what the first days need. */
export const REQUIRED_FIELDS: readonly DraftField[] = ['injury', 'injuryDate', 'hadSurgery', 'side']

const KNEE_INJURIES: readonly Injury[] = ['acl', 'meniscus', 'other']
const SPORTS = ['Basketball', 'Soccer', 'Volleyball', 'Skiing', 'Running', 'Other'] as const

const LABELS: Readonly<Record<DraftField, string>> = {
  name: copy.setup.fieldLabels.name,
  injury: copy.setup.fieldLabels.injury,
  injuryDate: copy.setup.fieldLabels.when,
  hadSurgery: copy.setup.fieldLabels.surgery,
  side: copy.setup.fieldLabels.side,
  sport: copy.setup.fieldLabels.sport,
}

const QUESTIONS: Readonly<Record<DraftField, string>> = {
  name: copy.setup.questions.name,
  injury: copy.setup.questions.injury,
  injuryDate: copy.setup.questions.when,
  hadSurgery: copy.setup.questions.surgery,
  side: copy.setup.questions.side,
  sport: copy.setup.questions.sport,
}

export const fieldLabel = (f: DraftField): string => LABELS[f]
export const fieldQuestion = (f: DraftField): string => QUESTIONS[f]

export function fieldValue(draft: Draft, f: DraftField, format: (date: string) => string): string | undefined {
  switch (f) {
    case 'name':
    case 'sport':
      return draft[f] || undefined
    case 'injury':
      return draft.injury ? copy.setup.injuries[draft.injury as keyof typeof copy.setup.injuries] : undefined
    case 'injuryDate':
      return draft.injuryDate ? format(draft.injuryDate) : undefined
    case 'hadSurgery':
      return draft.hadSurgery === undefined ? undefined : draft.hadSurgery ? copy.setup.yes : copy.setup.no
    case 'side':
      return draft.side ? copy.setup.sides[draft.side] : undefined
  }
}

interface FieldEditorProps {
  readonly field: DraftField
  readonly draft: Draft
  readonly onChange: (patch: Partial<Draft>) => void
}

/** One field's answer controls, the same in the checklist, the one-question screens and Settings. */
export function FieldEditor({ field, draft, onChange }: FieldEditorProps) {
  const { today } = useStore()
  switch (field) {
    case 'name':
      return <Field value={draft.name ?? ''} onChangeText={(name) => onChange({ name })} placeholder={copy.setup.namePlaceholder} autoCapitalize="words" autoComplete="given-name" />
    case 'injury':
      return (
        <ChipRow>
          {KNEE_INJURIES.map((i) => (
            <Chip key={i} label={copy.setup.injuries[i as keyof typeof copy.setup.injuries]} selected={draft.injury === i} onPress={() => onChange({ injury: i })} />
          ))}
        </ChipRow>
      )
    case 'injuryDate':
      return <DateField value={draft.injuryDate} addLabel={copy.setup.ptVisitAdd} defaultDate={today} max={today} onChange={(injuryDate) => onChange({ injuryDate })} />
    case 'hadSurgery':
      return (
        <ChipRow>
          <Chip label={copy.setup.yes} selected={draft.hadSurgery === true} onPress={() => onChange({ hadSurgery: true })} />
          <Chip label={copy.setup.no} selected={draft.hadSurgery === false} onPress={() => onChange({ hadSurgery: false })} />
        </ChipRow>
      )
    case 'side':
      return (
        <ChipRow>
          <Chip label={copy.setup.sides.left} selected={draft.side === 'left'} onPress={() => onChange({ side: 'left' })} />
          <Chip label={copy.setup.sides.right} selected={draft.side === 'right'} onPress={() => onChange({ side: 'right' })} />
        </ChipRow>
      )
    case 'sport':
      return (
        <View style={{ gap: space.sm }}>
          <ChipRow>
            {SPORTS.map((s) => (
              <Chip key={s} label={s} selected={draft.sport === s} onPress={() => onChange({ sport: s })} />
            ))}
          </ChipRow>
          <Field value={SPORTS.includes(draft.sport as (typeof SPORTS)[number]) ? '' : (draft.sport ?? '')} onChangeText={(sport) => onChange({ sport })} placeholder={copy.setup.sportPlaceholder} />
        </View>
      )
  }
}

interface ChoiceCardProps {
  readonly title: string
  readonly sub: string
  readonly onPress: () => void
  /** A selected option fills dark with a tick. Without it the card shows a chevron and acts at once. */
  readonly selected?: boolean
}

export function ChoiceCard({ title, sub, onPress, selected }: ChoiceCardProps) {
  const colors = useColors()
  const on = selected === true
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={() => {
        tapFeedback()
        onPress()
      }}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: on ? colors.accent : colors.surface, borderWidth: 1, borderColor: on ? colors.accent : colors.border, opacity: pressed ? 0.8 : 1 })}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt kind="bodyStrong" color={on ? 'onAccent' : 'text'}>
          {title}
        </Txt>
        <Txt kind="small" color={on ? 'onAccent' : 'textSecondary'}>
          {sub}
        </Txt>
      </View>
      {selected === undefined ? <SymbolView name="chevron.right" size={13} tintColor={colors.textMuted} /> : on ? <SymbolView name="checkmark" size={14} tintColor={colors.onAccent} /> : null}
    </Pressable>
  )
}
