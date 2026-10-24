/**
 * PLACEHOLDER design tokens. The real palette, type and radii are being
 * decided in the KINN Figma file; drop the values in here and every screen
 * follows. Keep this the only place a colour or size is written down.
 */
import { Platform } from 'react-native'

export const palette = {
  dark: {
    bg: '#0E0E0F',
    surface: '#19191B',
    surfaceRaised: '#232326',
    border: '#2E2E33',
    text: '#F4F4F2',
    textSecondary: '#A3A3A8',
    textMuted: '#6E6E75',
    accent: '#E8E6DF',
    onAccent: '#0E0E0F',
    good: '#8FBF8F',
    caution: '#D9C38A',
    warn: '#E0896B',
    track: '#2A2A2E',
  },
  light: {
    bg: '#F7F6F2',
    surface: '#FFFFFF',
    surfaceRaised: '#F0EFEA',
    border: '#E2E0D8',
    text: '#141414',
    textSecondary: '#5F5F66',
    textMuted: '#9A9AA1',
    accent: '#141414',
    onAccent: '#FFFFFF',
    good: '#4E8A4E',
    caution: '#A88A2E',
    warn: '#C2583A',
    track: '#E6E4DC',
  },
} as const

export type Scheme = keyof typeof palette
export type ColorToken = keyof typeof palette.dark

export const type = {
  display: { fontSize: 44, lineHeight: 48, fontWeight: '600' as const, letterSpacing: -1 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const, letterSpacing: -0.5 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  number: { fontSize: 64, lineHeight: 68, fontWeight: '600' as const, letterSpacing: -2 },
} as const

export const fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
})

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const
export const bottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const maxContentWidth = 560
