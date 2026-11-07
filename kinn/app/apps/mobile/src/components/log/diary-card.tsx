import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { hasRedFlagWords, parseJournal } from '@reco/core'
import type { JournalResult, JournalEntry } from '@reco/core'

import { VoiceBox } from '@/components/setup/voice-box'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ListRow } from '@/components/ui/list-row'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { successFeedback } from '@/haptics'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'

function RemoveButton({ onPress }: { readonly onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={copy.logFlow.remove} hitSlop={10} onPress={onPress}>
      <Txt kind="small" color="textSecondary">
        {copy.logFlow.remove}
      </Txt>
    </Pressable>
  )
}

/** Speak or type the day, then check what RECO picked out. Nothing saves until it is confirmed, and the words are kept with the day. */
export function DiaryCard() {
  const { addActivity, addRatedPain, addJournal, pressPain, updatePain } = useStore()
  const [text, setText] = useState('')
  const [source, setSource] = useState<JournalEntry['source']>('typed')
  const [sorted, setSorted] = useState<JournalResult | undefined>(undefined)
  const [saved, setSaved] = useState(false)

  const reset = () => {
    setText('')
    setSorted(undefined)
    setSource('typed')
  }

  const confirm = () => {
    const words = text.trim()
    if (sorted?.activity) addActivity(sorted.activity.activity, sorted.activity.intensity)
    if (sorted?.pain) addRatedPain(sorted.pain.pain, undefined, words)
    else if (hasRedFlagWords(words)) updatePain(pressPain(), { note: words })
    addJournal(words, source)
    successFeedback()
    reset()
    setSaved(true)
  }

  if (sorted) {
    const found = sorted.activity !== undefined || sorted.pain !== undefined || sorted.recovery.length > 0
    return (
      <Card index={0} style={{ gap: 0 }}>
        <SectionLabel spaced>{copy.logFlow.sortedInto}</SectionLabel>
        {sorted.activity ? (
          <ListRow
            title={copy.logFlow.activityRow(copy.log.activity[sorted.activity.activity], copy.log.intensity[sorted.activity.intensity])}
            right={<RemoveButton onPress={() => setSorted({ recovery: sorted.recovery, summary: sorted.summary, ...(sorted.pain ? { pain: sorted.pain } : {}) })} />}
          />
        ) : null}
        {sorted.pain ? (
          <ListRow
            title={copy.logFlow.painRow(sorted.pain.pain)}
            {...(sorted.pain.context ? { sub: sorted.pain.context } : {})}
            right={<RemoveButton onPress={() => setSorted({ recovery: sorted.recovery, summary: sorted.summary, ...(sorted.activity ? { activity: sorted.activity } : {}) })} />}
          />
        ) : null}
        {sorted.recovery.map((r) => (
          <ListRow key={r} title={r} sub={copy.logFlow.recoveryRow} right={<RemoveButton onPress={() => setSorted({ ...sorted, recovery: sorted.recovery.filter((x) => x !== r) })} />} />
        ))}
        <View style={{ gap: space.sm, paddingTop: space.sm }}>
          <Txt kind="small" color="textSecondary">
            {found ? copy.logFlow.phoneOnly : copy.logFlow.nothingFound}
          </Txt>
          <Txt kind="small" color="textMuted">
            {copy.logFlow.wordsNote}
          </Txt>
          <Button label={found ? copy.logFlow.confirm : copy.logFlow.saveNote} onPress={confirm} />
          <Button label={copy.logFlow.discard} variant="ghost" onPress={reset} />
        </View>
      </Card>
    )
  }

  return (
    <Card index={0}>
      <SectionLabel>{copy.logFlow.voiceLabel}</SectionLabel>
      <VoiceBox
        value={text}
        onChange={(t) => {
          setText(t)
          setSaved(false)
        }}
        onSpoke={() => setSource('voice')}
        placeholder={copy.logFlow.placeholder}
      />
      {saved ? (
        <Txt kind="small" color="textSecondary">
          {copy.logFlow.savedNote}
        </Txt>
      ) : null}
      <Button label={copy.logFlow.sort} disabled={!text.trim()} onPress={() => setSorted(parseJournal(text))} />
    </Card>
  )
}
