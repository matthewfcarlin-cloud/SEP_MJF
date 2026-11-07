import { router, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { addDays, dayLoad, exerciseDetail, morningMark, scheduledWeekdays, weekStartOf } from '@reco/core'
import type { MorningMark, Status } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle } from '@/components/ui/check'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { StatusPill } from '@/components/ui/status-pill'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { longWeekday, shortDate, timeOf } from '@/format'
import { useStore } from '@/store/provider'
import { space } from '@/theme/tokens'

const MARK_STATUS: Readonly<Partial<Record<MorningMark, Status>>> = { clear: 'keep-going', some: 'steady', flare: 'ease-off' }

function TimeRow({ time, title, sub, onPress }: { readonly time: string; readonly title: string; readonly sub?: string; readonly onPress?: () => void }) {
  return (
    <ListRow
      title={title}
      {...(sub ? { sub: time ? `${time} · ${sub}` : sub } : time ? { sub: time } : {})}
      {...(onPress ? { onPress } : {})}
    />
  )
}

export default function DayDetailScreen() {
  const { date = '' } = useLocalSearchParams<{ date: string }>()
  const { state, view } = useStore()
  const { data } = state
  const flareDates = new Set(view.flares.map((f) => f.date))
  const mark = morningMark(data, date, flareDates)
  const status = MARK_STATUS[mark]
  const checkIn = data.checkIns.find((c) => c.date === date)
  const pains = data.painLogs.filter((p) => p.date === date).sort((a, b) => a.t - b.t)
  const yesterdaysAnswers = data.painLogs.filter((p) => p.date === addDays(date, -1) && p.settled !== undefined)
  const activities = data.activityLogs.filter((l) => l.date === date)
  const words = [...(data.journal ?? []).filter((j) => j.date === date).map((j) => j.text), ...pains.flatMap((p) => (p.note ? [p.note] : []))]
  const evening = data.eveningChecks?.find((c) => c.date === date)
  const offset = Math.round((new Date(`${date}T12:00:00`).getTime() - new Date(`${weekStartOf(date)}T12:00:00`).getTime()) / 86_400_000)
  const planRows = (data.exercises ?? [])
    .filter((e) => scheduledWeekdays(e.daysPerWeek).includes(offset))
    .map((e) => ({ id: e.id, name: e.name, detail: exerciseDetail(e), done: (data.planMarks ?? []).some((m) => m.date === date && m.itemId === e.id && m.done) }))
    .filter((r) => r.done)
  const load = dayLoad(date, activities)
  const hasAnything = checkIn !== undefined || pains.length > 0 || activities.length > 0 || words.length > 0 || evening !== undefined || yesterdaysAnswers.length > 0
  const addHere = () => router.push({ pathname: '/add-day', params: { date } })

  if (!hasAnything) {
    return (
      <Screen variant="fullscreen" back={copy.settingsFlow.back} eyebrow={longWeekday(date)} title={shortDate(date)}>
        <Card>
          <Txt kind="bodyStrong">{copy.day.nothing}</Txt>
          <Txt kind="small" color="textSecondary">
            {copy.day.nothingBody}
          </Txt>
          <Button label={copy.day.add} variant="secondary" onPress={addHere} />
        </Card>
      </Screen>
    )
  }

  const summary = [checkIn ? copy.day.morningPain(checkIn.pain) : '', load.score > 0 ? copy.day.loadLine(load.score, view.baselineScore) : ''].filter(Boolean).join(' ')

  return (
    <Screen
      variant="fullscreen"
      back={copy.settingsFlow.back}
      eyebrow={longWeekday(date)}
      title={shortDate(date)}
      {...(summary ? { subtitle: summary } : {})}
      {...(status ? { right: <StatusPill status={status} word={copy.reportFlow.legendWords[mark]} /> } : {})}>
      <Card style={{ gap: 0 }}>
        <SectionLabel spaced>{copy.day.logged}</SectionLabel>
        {checkIn ? <TimeRow time="" title={copy.day.checkIn} sub={copy.day.checkInDetail(checkIn.pain, copy.day.swellingWord[checkIn.swelling])} /> : null}
        {yesterdaysAnswers.map((p) => (
          <TimeRow key={p.id} time="" title={copy.day.settled} sub={p.settled ? copy.day.settledAnswer[p.settled] : ''} />
        ))}
        {activities.map((l) => (
          <TimeRow key={l.id} time="" title={copy.log.activity[l.activity]} sub={copy.log.intensity[l.intensity]} />
        ))}
        {pains.map((p) => (
          <TimeRow
            key={p.id}
            time={timeOf(p.t)}
            title={p.kind === 'evening' ? copy.day.eveningTitle : copy.day.painTap(p.pain)}
            sub={p.doing ? copy.doing[p.doing] : p.pain === undefined && p.kind !== 'evening' ? copy.day.noDetail : ''}
            onPress={() => router.push({ pathname: '/pain', params: { id: p.id } })}
          />
        ))}
        {evening ? <TimeRow time="" title={copy.day.eveningTitle} sub={copy.day.eveningWord[evening.word]} /> : null}
      </Card>
      {words.length > 0 ? (
        <Card>
          <SectionLabel>{copy.day.yourWords}</SectionLabel>
          {words.map((w) => (
            <Txt key={w} kind="quote">
              {`“${w}”`}
            </Txt>
          ))}
        </Card>
      ) : null}
      {planRows.length > 0 ? (
        <Card style={{ gap: 0 }}>
          <SectionLabel spaced>{copy.day.plan}</SectionLabel>
          {planRows.map((r) => (
            <ListRow key={r.id} title={r.name} sub={r.detail} right={<CheckCircle done={r.done} />} />
          ))}
        </Card>
      ) : null}
      <View style={{ marginTop: space.xs }}>
        <Button label={copy.day.add} variant="ghost" onPress={addHere} />
      </View>
    </Screen>
  )
}
