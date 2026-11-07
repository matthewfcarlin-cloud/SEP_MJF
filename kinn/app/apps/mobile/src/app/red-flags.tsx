import { View } from 'react-native'

import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { space } from '@/theme/tokens'

/** Bundled so it works with no signal. Same list as the "When to call your doctor" section of the knee recovery guide. */
export default function RedFlagsScreen() {
  return (
    <Screen variant="modal" title={copy.redFlag.guideTitle}>
      <Card raised>
        <Txt>{copy.redFlag.guide911}</Txt>
      </Card>
      <Card>
        <Txt kind="bodyStrong">{copy.redFlag.guideCallLabel}</Txt>
        {copy.redFlag.guideList.map((item) => (
          <View key={item} style={{ flexDirection: 'row', gap: space.sm }}>
            <Txt color="textMuted">•</Txt>
            <Txt style={{ flex: 1 }}>{item}</Txt>
          </View>
        ))}
      </Card>
      <Txt kind="small" color="textMuted">
        {copy.inDevelopment}
      </Txt>
    </Screen>
  )
}
