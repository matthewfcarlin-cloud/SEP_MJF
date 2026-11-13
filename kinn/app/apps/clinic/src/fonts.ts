/**
 * The patient app's three faces (Geist, Geist Mono, Instrument Serif), loaded from the same
 * font packages so nothing is fetched from a third party. Text falls back to the system face
 * until they arrive.
 */
import geist400 from '@expo-google-fonts/geist/400Regular/Geist_400Regular.ttf'
import geist500 from '@expo-google-fonts/geist/500Medium/Geist_500Medium.ttf'
import mono400 from '@expo-google-fonts/geist-mono/400Regular/GeistMono_400Regular.ttf'
import mono500 from '@expo-google-fonts/geist-mono/500Medium/GeistMono_500Medium.ttf'
import serif400 from '@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.ttf'

const FACES: readonly { family: string; url: string; weight: string }[] = [
  { family: 'Geist', url: geist400, weight: '400' },
  { family: 'Geist', url: geist500, weight: '500' },
  { family: 'Geist Mono', url: mono400, weight: '400' },
  { family: 'Geist Mono', url: mono500, weight: '500' },
  { family: 'Instrument Serif', url: serif400, weight: '400' },
]

export function loadFonts(): void {
  for (const f of FACES) {
    const face = new FontFace(f.family, `url(${f.url})`, { weight: f.weight, display: 'swap' })
    face.load().then((loaded) => document.fonts.add(loaded)).catch((error: unknown) => console.warn('RECO: a font did not load.', error))
  }
}
