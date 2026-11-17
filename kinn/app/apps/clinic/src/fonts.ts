/**
 * Source Sans 3 for everything, numbers included (tabular figures), self-hosted from the font
 * package so nothing is fetched from a third party. A plain, open face that clinic and public
 * health software already use; it stays readable on a projected demo and a clinic screen.
 * The RECO wordmark is the brand SVG, never retyped.
 */
import sans400 from '@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2'
import sans600 from '@fontsource/source-sans-3/files/source-sans-3-latin-600-normal.woff2'
import sans700 from '@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff2'

const FAMILY = 'Source Sans 3'
const FACES: readonly { url: string; weight: string }[] = [
  { url: sans400, weight: '400' },
  { url: sans600, weight: '600' },
  { url: sans700, weight: '700' },
]

export function loadFonts(): void {
  for (const f of FACES) {
    const face = new FontFace(FAMILY, `url(${f.url}) format('woff2')`, { weight: f.weight, display: 'swap' })
    face.load().then((loaded) => document.fonts.add(loaded)).catch((error: unknown) => console.warn('RECO: a font did not load.', error))
  }
}
