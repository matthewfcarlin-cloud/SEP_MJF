import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { hasRedFlagWords, parseJournal } from '@reco/core'
import type { JournalResult, JournalEntry } from '@reco/core'

import { VoiceBox } from '@/components/setup/voice-box'
import { Button } from '@/components/ui/button'
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
export function SayOrType({ onSaved }: { readonly onSaved: () => void }) {
  const { addActivity, addRatedPain, addJournal, pressPain, updatePain } = useStore()
  const [text, setText] = useState('')
  const [source, setSource] = useState<JournalEntry['source']>('typed')
  const [sorted, setSorted] = useState<JournalResult | undefined>(undefined)

  const confirm = () => {
    const words = text.trim()
    if (sorted?.activity) addActivity(sorted.activity.activity, sorted.activity.intensity)
    if (sorted?.pain) addRatedPain(sorted.pain.pain, undefined, words)
    else if (hasRedFlagWords(words)) updatePain(pressPain(), { note: words })
    addJournal(words, source)
    successFeedback()
    onSaved()
  }

  if (sorted) {
    const found = sorted.activity !== undefined || sorted.pain !== undefined || sorted.recovery.length > 0
    return (
      <View>
        <SectionLabel spaced>{copy.logFlow.sortedInto}</SectionLabel>
        {sorted.activity ? (
          <ListRow
            first
            title={copy.logFlow.activityRow(copy.log.activity[sorted.activity.activity], copy.log.intensity[sorted.activity.intensity])}
            right={<RemoveButton onPress={() => setSorted({ recovery: sorted.recovery, summary: sorted.summary, ...(sorted.pain ? { pain: sorted.pain } : {}) })} />}
          />
        ) : null}
        {sorted.pain ? (
          <ListRow
            first={!sorted.activity}
            title={copy.logFlow.painRow(sorted.pain.pain)}
            {...(sorted.pain.context ? { sub: sorted.pain.context } : {})}
            right={<RemoveButton onPress={() => setSorted({ recovery: sorted.recovery, summary: sorted.summary, ...(sorted.activity ? { activity: sorted.activity } : {}) })} />}
          />
        ) : null}
        {sorted.recovery.map((r) => (
          <ListRow key={r} title={r} sub={copy.logFlow.recoveryRow} right={<RemoveButton onPress={() => setSorted({ ...sorted, recovery: sorted.recovery.filter((x) => x !== r) })} />} />
        ))}
        <View style={{ gap: space.sm, paddingTop: space.md }}>
          <Txt kind="small" color="textSecondary">
            {found ? copy.logFlow.phoneOnly : copy.logFlow.nothingFound}
          </Txt>
          <Button label={found ? copy.logFlow.confirm : copy.logFlow.saveNote} onPress={confirm} />
          <Button label={copy.logFlow.discard} variant="ghost" onPress={() => setSorted(undefined)} />
        </View>
      </View>
    )
  }

  return (
    <View style={{ gap: space.sm }}>
      <VoiceBox value={text} onChange={setText} onSpoke={() => setSource('voice')} placeholder={copy.logFlow.placeholder} />
      <Button label={copy.logFlow.sort} disabled={!text.trim()} onPress={() => setSorted(parseJournal(text))} />
    </View>
  )
}
