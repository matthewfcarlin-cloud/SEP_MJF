import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { copy } from './copy'

const SETTLE_HOUR = 8

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync()
    if (current.granted) return true
    const asked = await Notifications.requestPermissionsAsync()
    return asked.granted
  } catch (error) {
    console.warn('RECO: notification permission check failed.', error)
    return false
  }
}

/** Tomorrow at 08:00 local. */
const nextMorning = (now: Date): Date => {
  const d = new Date(now)
  d.setDate(d.getDate() + 1)
  d.setHours(SETTLE_HOUR, 0, 0, 0)
  return d
}

/** Schedules the "Did it settle?" question for the morning after a pain log. Returns the notification id. */
export async function scheduleSettleReminder(painLogId: string): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined
  const granted = await ensureNotificationPermission()
  if (!granted) return undefined
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: copy.pain.notificationTitle, body: copy.pain.notificationBody, data: { painLogId, route: '/settle' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextMorning(new Date()) },
    })
  } catch (error) {
    console.warn('RECO: could not schedule the settle reminder.', error)
    return undefined
  }
}
