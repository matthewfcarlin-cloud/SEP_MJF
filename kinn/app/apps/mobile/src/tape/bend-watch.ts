/**
 * Live bend from the tape, checked against the bend limit in force. Converts each LIVE reading
 * to degrees (protocol/bend.ts), and on a bend held past the limit buzzes the phone and saves
 * an alert, which Today counts. A real tape records in either mode; the demo tape only records
 * into sample data, so it never writes into a person's own record.
 */
import { BEND_WATCH_IDLE, bendAngle, stepBendWatch } from '@reco/core'
import type { BendWatchState } from '@reco/core'
import { useEffect, useRef } from 'react'

import { warningFeedback } from '@/haptics'
import { useStore } from '@/store/provider'

import { useTape } from './use-tape'

/** The knee's bend right now in degrees, or null without a calibrated tape and a bend calibration. */
export function useLiveBend(): number | null {
  const { latest, status } = useTape()
  const { state } = useStore()
  const cal = state.data.bendCalibration
  if (!latest || !latest.sensorOk || !status?.calibrated || !cal) return null
  return bendAngle(latest.raw, status, cal)
}

/** Mounted once under both providers. Renders nothing. */
export function BendWatch() {
  const { latest, source } = useTape()
  const { view, mode, addBendAlert } = useStore()
  const angle = useLiveBend()
  const watch = useRef<BendWatchState>(BEND_WATCH_IDLE)
  const limits = view.path?.limits
  const records = source === 'ble' || mode === 'sample'

  useEffect(() => {
    if (!latest || angle === null || !limits) {
      watch.current = BEND_WATCH_IDLE
      return
    }
    // The tape can't tell yet whether the leg is taking weight, so only the plain bend limit applies.
    const out = stepBendWatch(watch.current, { t: Date.now(), uptimeMs: latest.uptimeMs, angleDeg: angle, loaded: false }, limits)
    watch.current = out.state
    if (!out.alert) return
    warningFeedback()
    if (records) addBendAlert(out.alert)
  }, [latest, angle, limits, records, addBendAlert])

  return null
}
