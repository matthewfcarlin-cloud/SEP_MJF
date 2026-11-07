import { TextInput, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useDictation } from '@/dictation'
import { radius, space, type as typeScale } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

interface VoiceBoxProps {
  readonly value: string
  readonly onChange: (text: string) => void
  readonly placeholder: string
  /** Called when the words came from speech, so the record can say so. */
  readonly onSpoke?: () => void
}

/** Speak or type into one box. Voice stops at the door if it is refused or unavailable, and typing still works. */
export function VoiceBox({ value, onChange, placeholder, onSpoke }: VoiceBoxProps) {
  const colors = useColors()
  const dictation = useDictation((text) => {
    if (!text) return
    onChange(value ? `${value} ${text}` : text)
    onSpoke?.()
  })
  const shown = dictation.partial ? `${value} ${dictation.partial}`.trim() : value
  return (
    <View style={{ gap: space.sm }}>
      <TextInput
        multiline
        value={shown}
        onChangeText={onChange}
        editable={!dictation.listening}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={{ ...typeScale.body, minHeight: 120, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: dictation.listening ? colors.live : colors.border }}
      />
      {dictation.problem ? (
        <Txt kind="small" color="textSecondary">
          {dictation.problem === 'refused' ? copy.setup.micRefused : copy.setup.micUnavailable}
        </Txt>
      ) : (
        <Button label={dictation.listening ? copy.setup.micStop : copy.setup.micStart} variant="secondary" onPress={dictation.toggle} />
      )}
    </View>
  )
}
