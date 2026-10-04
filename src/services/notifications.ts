import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays, dayKey, deviceTimeZone, localDate } from '@/domain/dates';
import { reminderMessage } from '@/domain/messages';
import { planReminders, type ReminderPrefs } from '@/domain/reminders';
import type { UnitSystem } from '@/domain/types';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';
const CHANNEL = 'reminders';

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export const notificationsSupported = supported;

export async function getPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (!supported) return 'denied';
  const p = await Notifications.getPermissionsAsync();
  return p.granted ? 'granted' : p.canAskAgain ? 'undetermined' : 'denied';
}

/** Only call from a user tap (contextual ask), never at launch. */
export async function requestPermission(): Promise<boolean> {
  if (!supported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Hydration reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
}

export interface ScheduleInput { prefs: ReminderPrefs; goalMl: number; consumedMl: number; unitSystem: UnitSystem; now?: Date }

/** Rebuild the next ~2 days of reminders from scratch. Idempotent; call after any relevant change. */
export async function rescheduleReminders({ prefs, goalMl, consumedMl, unitSystem, now = new Date() }: ScheduleInput): Promise<number> {
  if (!supported) return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled || (await getPermission()) !== 'granted') return 0;
  const tz = deviceTimeZone();
  const today = dayKey(now, tz);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const plans = [
    { day: today, times: planReminders(prefs, { day: today, nowMin, consumedMl, goalMl }) },
    { day: addDays(today, 1), times: planReminders(prefs, { day: addDays(today, 1), nowMin: null, consumedMl: 0, goalMl }) },
  ];
  let n = 0;
  for (const { day, times } of plans) {
    for (const t of times) {
      const remaining = day === today ? Math.max(goalMl - consumedMl, 0) : goalMl;
      const body = prefs.showAmounts ? reminderMessage(n, remaining, goalMl, unitSystem) : reminderMessage(n, 0, goalMl, unitSystem);
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Plink', body, ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: localDate(day, t) },
      });
      n++;
    }
  }
  return n;
}
