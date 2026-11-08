import { View } from 'react-native'
import { warningCopy } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

/** On Today only, never a notification. Always says why, and can always be corrected. */
export function WarningCard({ index }: { readonly index: number }) {
  const { view, state, warningFeedback } = useStore()
  const colors = useColors()
  if (!view.warning) return null
  const text = warningCopy(view.warning, view.line, state.guidance)
  const answer = (kind: 'wrong' | 'helpful') => {
    successFeedback()
    warningFeedback(kind)
  }
  return (
    <Card index={index}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.warn }} />
        <SectionLabel>{copy.warning.label}</SectionLabel>
      </View>
      <Txt kind="bodyStrong">{text.facts}</Txt>
      {text.action ? <Txt color="textSecondary">{text.action}</Txt> : null}
      <Txt kind="small" color="textSecondary">
        {text.lineNote}
      </Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button label={copy.warning.wrong} variant="secondary" onPress={() => answer('wrong')} style={{ flex: 1, paddingHorizontal: space.sm }} />
        <Button label={copy.warning.helpful} variant="secondary" onPress={() => answer('helpful')} style={{ flex: 1, paddingHorizontal: space.sm }} />
      </View>
    </Card>
  )
}
