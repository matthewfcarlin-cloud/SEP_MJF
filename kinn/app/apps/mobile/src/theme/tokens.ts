/**
 * RECO design tokens: the "ceramic" palette from the Figma V1 screens (light ceramic page,
 * olive ink, one status colour per day). Dark is the same family at night. Keep this the
 * only place a colour or size is written down. Colours stay 6-digit hex: StatusPill and
 * others append a 2-digit alpha.
 */
import { Platform } from 'react-native'

export const palette = {
  dark: {
    bg: '#121410',
    surface: '#1A1D18',
    surfaceRaised: '#242820',
    border: '#2D3229',
    text: '#ECEAE3',
    textSecondary: '#B3B5AB',
    textMuted: '#8D9187',
    accent: '#E6E3D8',
    onAccent: '#1C1E1A',
    good: '#8CBC84',
    caution: '#DCAE55',
    warn: '#E3805A',
    track: '#2B2F27',
    live: '#3DDBB8',
    horizon: '#232920',
    onStatus: '#1C1E1A',
  },
  light: {
    bg: '#F2F1EC',
    surface: '#FBFAF7',
    surfaceRaised: '#E8E5DC',
    border: '#E0DCD1',
    text: '#1C1E1A',
    textSecondary: '#5C6058',
    // Figma's ink-3 (#8E9089) is under 4.5:1 for small labels on the page; this is the nearest that passes.
    textMuted: '#686B62',
    accent: '#2F3A2C',
    onAccent: '#F2F1EC',
    good: '#6F9E68',
    caution: '#C99A3A',
    warn: '#D4673F',
    track: '#E4E0D5',
    live: '#3DDBB8',
    horizon: '#D3DBCB',
    // Text on a solid good/caution/warn fill: dark ink passes 4.5:1 on all three in both schemes.
    onStatus: '#1C1E1A',
  },
} as const

export type Scheme = keyof typeof palette
export type ColorToken = keyof typeof palette.dark

export const fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: { sans: 'system-ui', rounded: 'system-ui', mono: "ui-monospace, 'SF Mono', Menlo, monospace" },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
})

export const type = {
  display: { fontSize: 44, lineHeight: 48, fontWeight: '600' as const, letterSpacing: -1 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const, letterSpacing: -0.5 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.9, textTransform: 'uppercase' as const, fontFamily: fonts.mono },
  number: { fontSize: 64, lineHeight: 68, fontWeight: '600' as const, letterSpacing: -2 },
  mono: { fontSize: 20, lineHeight: 26, fontWeight: '400' as const, fontFamily: fonts.mono },
} as const

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const
export const bottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const maxContentWidth = 560
