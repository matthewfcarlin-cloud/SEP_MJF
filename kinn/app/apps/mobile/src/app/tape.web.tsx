// Browser build only: pair a RECO tape over Web Bluetooth (or run the simulated tape) and
// show the live signal. iOS has tape.tsx instead; the phone app will get the tape through
// native Bluetooth later.
import { router } from 'expo-router'
import { View } from 'react-native'
import { RESULT_NAME } from '@reco/core'

import { copy } from '@/copy'
import { LiveGauge, LiveTrace } from '@/components/tape/live-gauge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { isConnected, useTape } from '@/tape/use-tape'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const WINDOW_MS = 10_000
const DEFAULT_THRESHOLD_PCT = 30

function Stat({ label, value, foot }: { readonly label: string; readonly value: string; readonly foot?: string }) {
  return (
    <View style={{ flex: 1, minWidth: 120, gap: 2 }}>
      <Txt kind="label" color="textMuted">
        {label}
      </Txt>
      <Txt kind="heading">{value}</Txt>
      {foot ? (
        <Txt kind="small" color="textMuted">
          {foot}
        </Txt>
      ) : null}
    </View>
  )
}

export default function TapeScreen() {
  const colors = useColors()
  const tape = useTape()
  const t = copy.tape

  if (!tape.source) {
    return (
      <Screen variant="modal" title={t.title} subtitle={t.subtitle}>
        <Card>
          <SectionLabel>{t.pairTitle}</SectionLabel>
          <Txt color="textSecondary">{t.pairBody}</Txt>
          <Button label={t.connect} disabled={!tape.support.ok} onPress={() => void tape.connectTape()} />
          {!tape.support.ok ? (
            <Txt kind="small" color="textMuted">
              {tape.support.reason}
            </Txt>
          ) : null}
        </Card>
        <Card index={1}>
          <SectionLabel>{t.demoTitle}</SectionLabel>
          <Txt color="textSecondary">{t.demoBody}</Txt>
          <Button label={t.demo} variant="secondary" onPress={() => void tape.startDemo()} />
        </Card>
        {tape.error ? (
          <Txt kind="small" color="warn">
            {tape.error}
          </Txt>
        ) : null}
        <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
          {t.footnote}
        </Txt>
        <Button label={copy.done} variant="ghost" onPress={() => router.back()} />
      </Screen>
    )
  }

  const connected = isConnected(tape.phase)
  const threshold = tape.status?.thresholdPct ?? DEFAULT_THRESHOLD_PCT
  const pct = tape.latest ? tape.latest.activationPermille / 10 : 0
  const contracting = tape.latest?.contracting ?? false
  const peak = tape.buffer.reduce((m, s) => Math.max(m, s.v), 0)
  const lastRep = tape.reps[tape.reps.length - 1]
  const calib = tape.lastCalibration

  return (
    <Screen variant="modal" title={t.title} subtitle={tape.name ?? undefined}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: connected ? colors.good : tape.phase === 'reconnecting' ? colors.caution : colors.warn }} />
        <Txt kind="small" color="textSecondary">
          {t.phase[tape.phase]}
          {tape.source === 'demo' ? ` · ${t.demoTag}` : ''}
        </Txt>
      </View>

      {tape.latest && !tape.latest.sensorOk ? (
        <Card raised style={{ borderColor: colors.warn }}>
          <Txt color="warn">{t.noContact}</Txt>
        </Card>
      ) : null}

      <Card raised style={{ alignItems: 'center', gap: space.md }}>
        <LiveGauge pct={pct} threshold={threshold} contracting={contracting} label={t.activation} />
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: radius.pill,
            backgroundColor: contracting ? colors.good : colors.surface,
            borderWidth: 1,
            borderColor: contracting ? colors.good : colors.border,
          }}>
          <Txt kind="small" color={contracting ? 'onAccent' : 'textSecondary'}>
            {contracting ? t.contracting : t.relaxed}
          </Txt>
        </View>
        <Txt kind="small" color="textMuted">
          {tape.holdMs !== null ? t.holding((tape.holdMs / 1000).toFixed(1)) : lastRep ? t.lastHold((lastRep.holdMs / 1000).toFixed(1), Math.round(lastRep.peakPermille / 10)) : t.squeezeHint}
        </Txt>
      </Card>

      <Card index={1}>
        <SectionLabel>{t.traceTitle}</SectionLabel>
        <LiveTrace buffer={tape.buffer} threshold={threshold} windowMs={WINDOW_MS} />
        <Txt kind="small" color="textMuted">
          {t.traceHint(threshold)}
        </Txt>
      </Card>

      <Card index={2}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          <Stat label={t.repsHere} value={String(tape.reps.length)} foot={t.repsHereFoot} />
          <Stat label={t.repsToday} value={tape.status ? String(tape.status.repsToday) : '—'} foot={t.repsTodayFoot} />
          <Stat label={t.peak} value={`${Math.round(peak)}%`} />
          <Stat label={t.signal} value={tape.latest ? String(tape.latest.raw) : '—'} foot={t.signalFoot} />
        </View>
        <Button label={t.resetReps} variant="ghost" onPress={tape.resetReps} />
      </Card>

      <Card index={3}>
        <SectionLabel>{t.calibrateTitle}</SectionLabel>
        <Txt color="textSecondary">{t.calibrateBody}</Txt>
        <Txt kind="small" color="textMuted">
          {tape.status?.calibrated ? t.calibrated(tape.status.restRaw, tape.status.maxRaw) : t.notCalibrated}
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <Button label={tape.busy === 'rest' ? t.sampling : t.calibrateRest} variant="secondary" disabled={!connected || tape.busy !== null} onPress={() => void tape.calibrate('rest')} style={{ flexGrow: 1 }} />
          <Button label={tape.busy === 'max' ? t.sampling : t.calibrateMax} variant="secondary" disabled={!connected || tape.busy !== null} onPress={() => void tape.calibrate('max')} style={{ flexGrow: 1 }} />
        </View>
        {calib ? (
          <Txt kind="small" color={calib.result === 0 ? 'good' : 'warn'}>
            {calib.result === 0 ? t.calibrationOk : t.calibrationFailed(RESULT_NAME[calib.result] ?? String(calib.result))}
          </Txt>
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button label={tape.busy === 'identify' ? t.blinking : t.blink} variant="secondary" disabled={!connected || tape.busy !== null} onPress={() => void tape.identify()} style={{ flex: 1 }} />
        <Button label={t.disconnect} variant="secondary" onPress={() => void tape.disconnect()} style={{ flex: 1 }} />
      </View>
      {tape.error ? (
        <Txt kind="small" color="warn">
          {tape.error}
        </Txt>
      ) : null}
      <Txt kind="small" color="textMuted" style={{ textAlign: 'center' }}>
        {t.footnote}
      </Txt>
      <Button label={copy.done} variant="ghost" onPress={() => router.back()} />
    </Screen>
  )
}
