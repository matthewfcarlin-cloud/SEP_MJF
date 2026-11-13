/**
 * Atkinson Hyperlegible Next for the interface and its Mono for every number and time,
 * self-hosted from the font packages (nothing fetched from a third party). Built by the Braille
 * Institute for legibility, which a projected demo and a clinic screen both need. The RECO
 * wordmark is the brand SVG, never retyped.
 */
import sans400 from '@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff2'
import sans500 from '@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-500-normal.woff2'
import sans700 from '@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-700-normal.woff2'
import mono400 from '@fontsource/atkinson-hyperlegible-mono/files/atkinson-hyperlegible-mono-latin-400-normal.woff2'
import mono500 from '@fontsource/atkinson-hyperlegible-mono/files/atkinson-hyperlegible-mono-latin-500-normal.woff2'

const FACES: readonly { family: string; url: string; weight: string }[] = [
  { family: 'Atkinson Hyperlegible Next', url: sans400, weight: '400' },
  { family: 'Atkinson Hyperlegible Next', url: sans500, weight: '500' },
  { family: 'Atkinson Hyperlegible Next', url: sans700, weight: '700' },
  { family: 'Atkinson Hyperlegible Mono', url: mono400, weight: '400' },
  { family: 'Atkinson Hyperlegible Mono', url: mono500, weight: '500' },
]

export function loadFonts(): void {
  for (const f of FACES) {
    const face = new FontFace(f.family, `url(${f.url}) format('woff2')`, { weight: f.weight, display: 'swap' })
    face.load().then((loaded) => document.fonts.add(loaded)).catch((error: unknown) => console.warn('RECO: a font did not load.', error))
  }
}
