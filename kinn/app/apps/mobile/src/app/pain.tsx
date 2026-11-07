import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Doing } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Chip, ChipRow } from '@/components/ui/chip'
import { PainSlider } from '@/components/ui/pain-slider'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { keepFile } from '@/files'
import { timeOf } from '@/format'
import { tapFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const DOING: readonly Doing[] = ['practice', 'game', 'gym', 'pt', 'walking', 'rest', 'other']
const UNDO_SECONDS = 10

function UndoBar({ time, onUndo }: { readonly time: string; readonly onUndo: () => void }) {
  const colors = useColors()
  const [left, setLeft] = useState(UNDO_SECONDS)
  useEffect(() => {
    if (left <= 0) return undefined
    const timer = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 10, paddingHorizontal: space.md }}>
      <SymbolView name="checkmark" size={13} tintColor={colors.onAccent} />
      <Txt kind="small" color="onAccent" style={{ flex: 1 }}>
        {copy.painDetail.savedAt(time)}
      </Txt>
      {left > 0 ? (
        <Pressable accessibilityRole="button" hitSlop={10} onPress={onUndo}>
          <Txt kind="small" color="onAccent">
            {copy.painDetail.undo(left)}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  )
}

function AttachRow({ icon, label, onPress, done }: { readonly icon: 'mic' | 'mic.fill' | 'camera'; readonly label: string; readonly onPress: () => void; readonly done: boolean }) {
  const colors = useColors()
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 })}>
      <SymbolView name={done ? 'checkmark' : icon} size={16} tintColor={colors.text} />
      <Txt kind="small">{label}</Txt>
    </Pressable>
  )
}

/** The optional detail after one tap. The press is saved already and each answer saves as it is given, so leaving this sheet any way keeps them. */
export default function PainDetailSheet() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>()
  const { state, updatePain, removePain } = useStore()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const log = state.data.painLogs.find((p) => p.id === id)
  const [recording, setRecording] = useState(false)
  const [notice, setNotice] = useState<string | undefined>(undefined)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)

  if (!log) return null

  const toggleVoice = async () => {
    try {
      if (recording) {
        await recorder.stop()
        setRecording(false)
        if (recorder.uri) updatePain(log.id, { voiceUri: keepFile(recorder.uri, 'voice') })
        return
      }
      const permission = await requestRecordingPermissionsAsync()
      if (!permission.granted) {
        setNotice(copy.painDetail.voiceRefused)
        return
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
      await recorder.prepareToRecordAsync()
      recorder.record()
      setRecording(true)
      setNotice(undefined)
    } catch (error) {
      console.warn('RECO: voice note did not save.', error)
      setRecording(false)
      setNotice(copy.painDetail.voiceFailed)
    }
  }

  const savePhoto = (result: ImagePicker.ImagePickerResult) => {
    const uri = result.assets?.[0]?.uri
    if (!result.canceled && uri) updatePain(log.id, { photoUri: keepFile(uri, 'photo') })
  }
  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        setNotice(copy.painDetail.photoRefused)
        return
      }
      savePhoto(await ImagePicker.launchCameraAsync({ quality: 0.7 }))
    } catch (error) {
      console.warn('RECO: photo did not save.', error)
      setNotice(copy.painDetail.photoFailed)
    }
  }
  const choosePhoto = async () => {
    try {
      savePhoto(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 }))
    } catch (error) {
      console.warn('RECO: photo did not save.', error)
      setNotice(copy.painDetail.photoFailed)
    }
  }
  const askPhoto = () =>
    Alert.alert(copy.painDetail.photoAdd, undefined, [
      { text: copy.painDetail.photoTake, onPress: () => void takePhoto() },
      { text: copy.painDetail.photoChoose, onPress: () => void choosePhoto() },
      { text: copy.painDetail.photoCancel, style: 'cancel' },
    ])

  const undo = () => {
    tapFeedback()
    removePain(log.id)
    router.back()
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.md, paddingTop: space.lg, paddingBottom: insets.bottom + space.md, gap: space.md }} keyboardShouldPersistTaps="handled">
      {fresh ? <UndoBar time={timeOf(log.t)} onUndo={undo} /> : null}
      <View style={{ gap: 2 }}>
        <SectionLabel>{copy.painDetail.eyebrow}</SectionLabel>
        <Txt kind="title" style={{ fontSize: 24, lineHeight: 30 }}>
          {copy.painDetail.title}
        </Txt>
      </View>
      <PainSlider value={log.pain} onChange={(pain) => updatePain(log.id, { pain })} />
      <SectionLabel>{copy.painDetail.doing}</SectionLabel>
      <ChipRow>
        {DOING.map((d) => (
          <Chip key={d} label={copy.doing[d]} selected={log.doing === d} onPress={() => updatePain(log.id, { doing: log.doing === d ? undefined : d })} />
        ))}
      </ChipRow>
      <AttachRow icon={recording ? 'mic.fill' : 'mic'} done={!recording && log.voiceUri !== undefined} label={recording ? copy.painDetail.voiceStop : log.voiceUri ? copy.painDetail.voiceSaved : copy.painDetail.voiceAdd} onPress={() => void toggleVoice()} />
      <AttachRow icon="camera" done={log.photoUri !== undefined} label={log.photoUri ? copy.painDetail.photoSaved : copy.painDetail.photoAdd} onPress={askPhoto} />
      <Txt kind="small" color={notice ? 'warn' : 'textMuted'}>
        {notice ?? copy.painDetail.stays}
      </Txt>
      <Button label={copy.painDetail.done} onPress={() => router.back()} />
      <Button label={copy.painDetail.skip} variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  )
}
