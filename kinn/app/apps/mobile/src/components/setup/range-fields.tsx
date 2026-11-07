import { TextInput, View } from 'react-native'
import type { RomDay } from '@reco/core'

import { SectionLabel } from '@/components/ui/section-label'
import { fonts, radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'
import { copy } from '@/copy'

const MAX_BEND = 160
const MAX_DEFICIT = 45

export interface RangeText {
  readonly bend: string
  readonly straighten: string
}

function BigNumber({ label, value, onChange }: { readonly label: string; readonly value: string; readonly onChange: (v: string) => void }) {
  const colors = useColors()
  return (
    <View style={{ flex: 1, gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      <SectionLabel>{label}</SectionLabel>
      <TextInput value={value} onChangeText={onChange} keyboardType="number-pad" maxLength={3} placeholder="–" placeholderTextColor={colors.textMuted} accessibilityLabel={label} style={{ fontFamily: fonts.mono, fontSize: 36, lineHeight: 44, color: colors.text }} />
    </View>
  )
}

export function RangeFields({ value, onChange }: { readonly value: RangeText; readonly onChange: (next: RangeText) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      <BigNumber label={copy.measure.bend} value={value.bend} onChange={(bend) => onChange({ ...value, bend })} />
      <BigNumber label={copy.measure.straighten} value={value.straighten} onChange={(straighten) => onChange({ ...value, straighten })} />
    </View>
  )
}

/** Both numbers within a plausible range, or undefined. */
export function parseRange(text: RangeText, date: string, source: RomDay['source']): RomDay | undefined {
  const flexionDeg = Number(text.bend)
  const extensionDeficitDeg = Number(text.straighten)
  if (text.bend.trim() === '' || text.straighten.trim() === '') return undefined
  if (!Number.isInteger(flexionDeg) || flexionDeg < 0 || flexionDeg > MAX_BEND) return undefined
  if (!Number.isInteger(extensionDeficitDeg) || extensionDeficitDeg < 0 || extensionDeficitDeg > MAX_DEFICIT) return undefined
  return { date, flexionDeg, extensionDeficitDeg, source }
}
