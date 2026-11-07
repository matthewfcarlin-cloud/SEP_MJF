import * as Notifications from 'expo-notifications'
import { startOfDay, addDays } from '@reco/core'
import { Platform } from 'react-native'

import { copy } from './copy'
import type { NotificationMode } from './store/state'

const MORNING_HOUR = 8
const EVENING_HOUR = 20
const VISIT_REMINDER_HOUR = 18

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false
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

const daily = (hour: number): Notifications.DailyTriggerInput => ({ type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 })

async function replaceReminders(mode: NotificationMode, nextVisit: string | undefined): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    const { granted } = await Notifications.getPermissionsAsync()
    if (!granted || mode === 'off') return
    if (mode === 'morning' || mode === 'morning-evening') {
      await Notifications.scheduleNotificationAsync({ content: { title: copy.notifications.morningTitle, body: copy.notifications.morningBody, data: { route: '/' } }, trigger: daily(MORNING_HOUR) })
    }
    if (mode === 'morning-evening') {
      await Notifications.scheduleNotificationAsync({ content: { title: copy.notifications.eveningTitle, body: copy.notifications.eveningBody, data: { route: '/evening' } }, trigger: daily(EVENING_HOUR) })
    }
    const reminderAt = nextVisit ? startOfDay(addDays(nextVisit, -1), VISIT_REMINDER_HOUR) : undefined
    if (reminderAt !== undefined && reminderAt > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: { title: copy.notifications.visitTitle, body: copy.notifications.visitBody, data: { route: '/report' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(reminderAt) },
      })
    }
  } catch (error) {
    console.warn('RECO: could not schedule reminders.', error)
  }
}

/** Each sync waits for the last, so two quick changes cannot interleave and schedule a reminder twice. */
let lastSync: Promise<void> = Promise.resolve()

/**
 * Replaces every scheduled reminder with what the person chose. One morning prompt covers the
 * check-in, last night's pain and the plan, so nothing else gets its own notification. It never
 * asks for permission: that happens once, when the person picks a choice.
 */
export function syncNotifications(mode: NotificationMode, nextVisit: string | undefined): Promise<void> {
  if (Platform.OS === 'web') return Promise.resolve()
  lastSync = lastSync.then(() => replaceReminders(mode, nextVisit))
  return lastSync
}
