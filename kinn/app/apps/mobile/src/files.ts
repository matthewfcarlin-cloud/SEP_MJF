/**
 * Voice notes and photos stay on the phone. Pickers and recorders hand back temporary paths,
 * so a file is copied into the app's documents before its path is saved.
 */
import { File, Paths } from 'expo-file-system'
import { Platform } from 'react-native'

export function keepFile(uri: string, prefix: string): string {
  if (Platform.OS === 'web') return uri
  const ext = uri.split('.').pop() ?? 'dat'
  const dest = new File(Paths.document, `${prefix}-${Date.now().toString(36)}.${ext}`)
  new File(uri).copy(dest)
  return dest.uri
}

/** Best effort: a file already gone is what we wanted anyway. */
export function removeFiles(uris: readonly string[]): void {
  if (Platform.OS === 'web') return
  for (const uri of uris) {
    try {
      const file = new File(uri)
      if (file.exists) file.delete()
    } catch (error) {
      console.warn('RECO: could not remove a saved file.', error)
    }
  }
}
