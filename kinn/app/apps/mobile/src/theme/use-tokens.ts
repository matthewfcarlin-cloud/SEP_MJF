import { useColorScheme } from 'react-native'

import { palette } from './tokens'
import type { Scheme } from './tokens'

export function useScheme(): Scheme {
  return useColorScheme() === 'light' ? 'light' : 'dark'
}

export function useColors() {
  return palette[useScheme()]
}
