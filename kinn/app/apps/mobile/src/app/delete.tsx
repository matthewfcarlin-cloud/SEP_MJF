import { router } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

export default function DeleteSheet() {
  const { deleteMyData } = useStore()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const confirm = () => {
    deleteMyData()
    router.dismissAll()
    router.replace('/onboarding')
  }
  return (
    <View style={{ backgroundColor: colors.bg, padding: space.md, paddingTop: space.lg, paddingBottom: insets.bottom + space.md, gap: space.sm }}>
      <SectionLabel>{copy.deleteData.eyebrow}</SectionLabel>
      <Txt kind="title" style={{ fontSize: 24, lineHeight: 30 }}>
        {copy.deleteData.title}
      </Txt>
      <Txt color="textSecondary" style={{ marginBottom: space.sm }}>
        {copy.deleteData.body}
      </Txt>
      <Button label={copy.deleteData.exportFirst} onPress={() => router.replace('/backup')} />
      <Button label={copy.deleteData.confirm} variant="secondary" labelColor="warn" onPress={confirm} />
      <Button label={copy.deleteData.cancel} variant="ghost" onPress={() => router.back()} />
    </View>
  )
}
