import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const canBuzz = Platform.OS === 'ios' || Platform.OS === 'android'

/** Light tick for selections. Never throws. */
export function tapFeedback(): void {
  if (!canBuzz) return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined)
}

/** Confirmation for a saved entry. */
export function successFeedback(): void {
  if (!canBuzz) return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined)
}
