/**
 * Backup and trial export. The browser build downloads files; the phone writes one JSON file and
 * hands it to the share sheet or Mail. Audio, photos and the person's own words are not included.
 */
import Constants from 'expo-constants'
import { File, Paths } from 'expo-file-system'
import * as MailComposer from 'expo-mail-composer'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'
import { dailyCsv, exportStem, tapeMinutesCsv, trialExport } from '@reco/core'
import type { TrialExport } from '@reco/core'

import { copy } from '@/copy'
import type { AppState } from '@/store/state'
import { tapeLog, tapeLogReady } from '@/tape/tape-log'

export const TEAM_EMAIL = 'recowearable@gmail.com'

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

async function buildExport(state: AppState, today: string): Promise<TrialExport> {
  await tapeLogReady
  return trialExport({
    data: state.data,
    seededFor: state.seededFor,
    today,
    tape: { cursors: [...tapeLog.cursors.values()], calibrations: tapeLog.calibrations, records: tapeLog.all() },
    exportedAt: Date.now(),
    appVersion: Constants.expoConfig?.version ?? 'unknown',
    guidance: state.guidance,
  })
}

function writeJson(exp: TrialExport): File {
  const file = new File(Paths.cache, `${exportStem(exp)}.json`)
  if (file.exists) file.delete()
  file.write(JSON.stringify(exp, null, 2))
  return file
}

/** Saves a copy through the share sheet ("Save to Files"), or downloads it in the browser. */
export async function saveExport(state: AppState, today: string): Promise<void> {
  const exp = await buildExport(state, today)
  const stem = exportStem(exp)
  if (Platform.OS === 'web') {
    download(`${stem}.json`, JSON.stringify(exp, null, 2), 'application/json')
    download(`${stem}-daily.csv`, dailyCsv(exp), 'text/csv')
    download(`${stem}-tape-minutes.csv`, tapeMinutesCsv(exp), 'text/csv')
    return
  }
  await Sharing.shareAsync(writeJson(exp).uri, { mimeType: 'application/json', UTI: 'public.json' })
}

/** Opens Mail to the team with the file attached, or the share sheet when Mail is not set up. Nothing sends itself. */
export async function sendExportToTeam(state: AppState, today: string): Promise<void> {
  const exp = await buildExport(state, today)
  const file = writeJson(exp)
  if (await MailComposer.isAvailableAsync()) {
    await MailComposer.composeAsync({ recipients: [TEAM_EMAIL], subject: copy.backup.mailSubject, body: copy.backup.mailBody, attachments: [file.uri] })
    return
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' })
}
