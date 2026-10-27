/**
 * Trial data export. The browser build downloads three files (full JSON, one row per day,
 * one row per tape minute). The phone build hands the JSON to the share sheet, where it can
 * be saved to Files or sent; native file export can replace this once expo-sharing is added.
 */
import Constants from 'expo-constants'
import { Platform, Share } from 'react-native'
import { dailyCsv, exportStem, tapeMinutesCsv, trialExport } from '@reco/core'

import type { AppState } from '@/store/state'
import { tapeLog, tapeLogReady } from '@/tape/tape-log'

function download(filename: string, body: string, type: string): void {
  const url = URL.createObjectURL(new Blob([body], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function exportTrialData(state: AppState, today: string): Promise<void> {
  await tapeLogReady
  const exp = trialExport({
    data: state.data,
    seededFor: state.seededFor,
    today,
    tape: { cursors: [...tapeLog.cursors.values()], calibrations: tapeLog.calibrations, records: tapeLog.all() },
    exportedAt: Date.now(),
    appVersion: Constants.expoConfig?.version ?? 'unknown',
  })
  const stem = exportStem(exp)
  if (Platform.OS === 'web') {
    download(`${stem}.json`, JSON.stringify(exp, null, 2), 'application/json')
    download(`${stem}-daily.csv`, dailyCsv(exp), 'text/csv')
    download(`${stem}-tape-minutes.csv`, tapeMinutesCsv(exp), 'text/csv')
    return
  }
  await Share.share({ title: `${stem}.json`, message: JSON.stringify(exp) })
}
