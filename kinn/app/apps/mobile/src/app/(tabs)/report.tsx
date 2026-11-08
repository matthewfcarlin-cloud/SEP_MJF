import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { DEFAULT_SECTIONS, addDays, reportHtml, weekChange, weekHeadline, weeklySummary } from '@reco/core'
import type { MorningMark, ReportSections } from '@reco/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DateField } from '@/components/ui/date-field'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { shortDate, timeOf, weekday } from '@/format'
import { emailReport, shareReport } from '@/report-pdf'
import { useStore } from '@/store/provider'
import { usePlan } from '@/store/use-plan'
import { radius, space } from '@/theme/tokens'
import type { ColorToken } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const MORNING_COLOR: Record<MorningMark, ColorToken> = { clear: 'good', some: 'caution', flare: 'warn', none: 'textMuted' }
const LITTLE_DATA_DAYS = 3
const LEGEND: readonly MorningMark[] = ['clear', 'some', 'flare']

const signed = (n: number): string => (n > 0 ? `+${n}` : String(n))
const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? ''

function useReport(sections: ReportSections) {
  const { state, today, view } = useStore()
  const plan = usePlan()
  const { data } = state
  const weekEnd = addDays(today, -1)
  const summary = weeklySummary(data, weekEnd)
  const change = weekChange(data, weekEnd)
  const logged = new Set([...data.activityLogs.map((l) => l.date), ...data.painLogs.map((p) => p.date), ...data.checkIns.map((c) => c.date)])
  const loggedDaysThisWeek = [...logged].filter((d) => d >= summary.weekStart && d <= summary.weekEnd).length
  const hasPlan = plan.kind !== 'none' && !plan.empty
  const html = reportHtml({
    data,
    summary,
    change,
    sections,
    loggedDaysThisWeek,
    generated: today,
    ...(hasPlan ? { plan: { done: plan.done, planned: plan.planned, note: copy.reportFlow.planNote[plan.kind] } } : {}),
  })
  const fileName = `RECO report ${shortDate(summary.weekStart)} to ${shortDate(summary.weekEnd)}`
  return { state, view, plan, hasPlan, data, summary, change, html, fileName, loggedDaysThisWeek, headline: weekHeadline(summary, change, sections.range) }
}

function VisitCard() {
  const { state, today, updateProfile } = useStore()
  const { ptName, nextVisit } = state.data.profile
  const name = firstName(ptName ?? '')
  if (nextVisit === addDays(today, 1)) {
    return (
      <Card raised>
        <SectionLabel>{copy.reportFlow.tomorrowEyebrow(shortDate(nextVisit))}</SectionLabel>
        <Txt kind="bodyStrong">{copy.reportFlow.tomorrowTitle(name)}</Txt>
        <Txt kind="small" color="textSecondary">
          {copy.reportFlow.tomorrowBody}
        </Txt>
      </Card>
    )
  }
  if (nextVisit === undefined || nextVisit >= today) return null
  return (
    <Card>
      <SectionLabel>{copy.reportFlow.afterEyebrow}</SectionLabel>
      <Txt kind="bodyStrong">{copy.reportFlow.afterTitle(name)}</Txt>
      <DateField label={copy.reportFlow.nextVisit} value={undefined} addLabel={copy.reportFlow.addDate} defaultDate={addDays(today, 7)} min={today} onChange={(d) => updateProfile({ nextVisit: d })} />
      <Button label={copy.reportFlow.addMeasure} variant="secondary" onPress={() => router.push('/measure')} />
    </Card>
  )
}

function Tile({ label, value, delta }: { readonly label: string; readonly value: string; readonly delta?: string }) {
  return (
    <Card style={{ flexBasis: '47%', flexGrow: 1 }}>
      <SectionLabel>{label}</SectionLabel>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
        <Txt kind="mono" style={{ fontSize: 24, lineHeight: 30 }}>
          {value}
        </Txt>
        {delta ? (
          <Txt kind="small" color="textMuted">
            {delta}
          </Txt>
        ) : null}
      </View>
    </Card>
  )
}

function Preview({ sections }: { readonly sections: ReportSections }) {
  const colors = useColors()
  const report = useReport(sections)
  const { summary, change, data } = report
  const { profile } = data
  const [notice, setNotice] = useState<string | undefined>(undefined)
  const maxScore = Math.max(1, ...summary.rows.map((r) => r.load.score))
  const pains = data.painLogs.filter((p) => p.date >= summary.weekStart && p.date <= summary.weekEnd)
  const notes = (data.journal ?? []).filter((j) => j.date >= summary.weekStart && j.date <= summary.weekEnd)
  const measured = data.romDays.filter((r) => r.date >= summary.weekStart && r.date <= summary.weekEnd).sort((a, b) => a.date.localeCompare(b.date)).at(-1)

  const run = async (action: () => Promise<boolean | void>) => {
    setNotice(undefined)
    try {
      const sent = await action()
      if (sent === false) setNotice(copy.reportFlow.mailMissing)
    } catch (error) {
      console.warn('RECO: the report did not send.', error)
      setNotice(copy.reportFlow.failed)
    }
  }
  const email = () => run(() => emailReport(report.html, report.fileName, profile.ptEmail))
  const share = () => run(() => shareReport(report.html, report.fileName))

  return (
    <>
      {sections.headline ? (
        <Card style={{ backgroundColor: colors.accent, borderColor: colors.accent, padding: space.lg }}>
          <Txt kind="label" color="onAccent">
            {copy.report.headlineTitle}
          </Txt>
          <Txt kind="heading" color="onAccent">
            {report.headline}
          </Txt>
        </Card>
      ) : null}
      {sections.days ? (
        <Card>
          <SectionLabel>{copy.report.daysTitle}</SectionLabel>
          {summary.rows.map((row) => (
            <View key={row.load.date} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Txt kind="small" color="textSecondary" style={{ width: 32 }}>
                {weekday(row.load.date)}
              </Txt>
              <View accessibilityLabel={copy.reportFlow.legendWords[row.morning]} style={{ width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors[MORNING_COLOR[row.morning]], opacity: row.morning === 'none' ? 0.35 : 1 }} />
              <View style={{ flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
                <View style={{ width: `${Math.max(2, (100 * row.load.score) / maxScore)}%`, height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill }} />
              </View>
              <Txt kind="small" style={{ width: 26, textAlign: 'right' }}>
                {row.load.score}
              </Txt>
              <Txt kind="small" color="textMuted" style={{ width: 70 }} numberOfLines={1}>
                {row.activities.length ? row.activities.map((a) => copy.log.activity[a].split(' ')[0]).join(', ') : copy.report.none}
              </Txt>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xs }}>
            {LEGEND.map((m) => (
              <View key={m} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors[MORNING_COLOR[m]] }} />
                <Txt kind="small" color="textSecondary">
                  {copy.reportFlow.legendWords[m]}
                </Txt>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
      <SectionLabel>{copy.reportFlow.versusLast}</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Tile label={copy.reportFlow.avgLoad} value={String(summary.avgScore)} delta={signed(change.avgScoreDelta)} />
        {sections.range ? <Tile label={copy.reportFlow.deepestBend} value={summary.peakFlexionDeg !== undefined ? `${summary.peakFlexionDeg}°` : '–'} {...(change.flexionDeltaDeg !== undefined ? { delta: `${signed(change.flexionDeltaDeg)}°` } : {})} /> : null}
        <Tile label={copy.reportFlow.flareMornings} value={String(summary.flares.length)} delta={signed(change.flareDelta)} />
        {sections.range ? <Tile label={copy.reportFlow.straightening} value={summary.bestExtensionDeficitDeg !== undefined ? `${summary.bestExtensionDeficitDeg}°` : '–'} {...(change.extensionDeltaDeg === 0 ? { delta: copy.reportFlow.held } : {})} /> : null}
      </View>
      {sections.range ? (
        <Card>
          <SectionLabel>{copy.reportFlow.sections.range.title}</SectionLabel>
          <Txt kind="small">{measured ? copy.reportFlow.rangeLine(measured.flexionDeg, measured.extensionDeficitDeg, copy.read.who[measured.source]) : copy.reportFlow.noRange}</Txt>
        </Card>
      ) : null}
      {sections.pain ? (
        <Card style={{ gap: 0 }}>
          <SectionLabel spaced>{copy.reportFlow.painLogsTitle}</SectionLabel>
          {pains.length === 0 ? <ListRow title={copy.reportFlow.noneLogged} /> : null}
          {pains.map((p) => (
            <ListRow key={p.id} title={`${weekday(p.date)} · ${copy.day.painTap(p.pain)}`} sub={[timeOf(p.t), p.doing ? copy.doing[p.doing] : undefined, p.settled ? copy.reportFlow.settledLabel[p.settled] : undefined].filter(Boolean).join(' · ')} />
          ))}
        </Card>
      ) : null}
      {sections.plan && report.hasPlan ? (
        <Card>
          <SectionLabel>{copy.reportFlow.planTitle}</SectionLabel>
          <Txt kind="small">{copy.reportFlow.planCount(report.plan.done, report.plan.planned)}</Txt>
        </Card>
      ) : null}
      {sections.notes && notes.length > 0 ? (
        <Card>
          <SectionLabel>{copy.reportFlow.notesTitle}</SectionLabel>
          {notes.map((n) => (
            <Txt key={n.id} kind="quote">{`“${n.text}”`}</Txt>
          ))}
        </Card>
      ) : null}
      <Card raised>
        <SectionLabel>{profile.ptName ? copy.reportFlow.shareWithPt : copy.reportFlow.shareIt}</SectionLabel>
        {profile.ptName ? <Txt kind="bodyStrong">{profile.ptName}</Txt> : null}
        <Txt kind="small" color="textSecondary">
          {copy.reportFlow.includes(sections.notes)}
        </Txt>
        <Button label={profile.ptName ? copy.reportFlow.email(firstName(profile.ptName)) : copy.reportFlow.emailGeneric} onPress={() => void email()} />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button label={copy.reportFlow.savePdf} variant="secondary" onPress={() => void share()} style={{ flex: 1, paddingHorizontal: space.sm }} />
          <Button label={copy.reportFlow.share} variant="secondary" onPress={() => void share()} style={{ flex: 1, paddingHorizontal: space.sm }} />
        </View>
        {notice ? (
          <Txt kind="small" color="textSecondary">
            {notice}
          </Txt>
        ) : null}
      </Card>
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {copy.inDevelopment}
      </Txt>
    </>
  )
}

/** The week's report, ready to send. What goes in is fixed, so there is nothing to set each time. */
export default function ReportScreen() {
  const { mode } = useStore()
  const report = useReport(DEFAULT_SECTIONS)
  const { summary } = report
  const eyebrow = `${shortDate(summary.weekStart)} – ${shortDate(summary.weekEnd)}`
  const isThin = report.loggedDaysThisWeek < LITTLE_DATA_DAYS
  return (
    <Screen eyebrow={eyebrow} title={copy.reportFlow.title}>
      <VisitCard />
      {isThin ? (
        <Card raised>
          <Txt kind="bodyStrong">{copy.reportFlow.littleTitle(report.loggedDaysThisWeek)}</Txt>
          <Txt kind="small" color="textSecondary">
            {copy.reportFlow.littleBody}
          </Txt>
        </Card>
      ) : null}
      <Preview sections={DEFAULT_SECTIONS} />
      {mode === 'sample' ? (
        <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
          {copy.sampleData}
        </Txt>
      ) : null}
    </Screen>
  )
}
