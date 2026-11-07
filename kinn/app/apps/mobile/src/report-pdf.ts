import { File, Paths } from 'expo-file-system'
import * as MailComposer from 'expo-mail-composer'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'

import { copy } from '@/copy'

/** Turns the report into a named PDF in the cache. It stays on the phone until the person sends it. */
async function writePdf(html: string, name: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html })
  const dest = new File(Paths.cache, `${name}.pdf`)
  if (dest.exists) dest.delete()
  new File(uri).move(dest)
  return dest.uri
}

export async function shareReport(html: string, name: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html })
    return
  }
  await Sharing.shareAsync(await writePdf(html, name), { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' })
}

/** Returns false when Mail is not set up, after opening the share sheet instead. */
export async function emailReport(html: string, name: string, recipient: string | undefined): Promise<boolean> {
  if (Platform.OS === 'web' || !(await MailComposer.isAvailableAsync())) {
    await shareReport(html, name)
    return false
  }
  await MailComposer.composeAsync({ ...(recipient ? { recipients: [recipient] } : {}), subject: copy.reportFlow.mailSubject, body: copy.reportFlow.mailBody, attachments: [await writePdf(html, name)] })
  return true
}
