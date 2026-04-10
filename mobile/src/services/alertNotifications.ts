import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { ALERT_CACHE_KEY, ALERT_DESCRIPTIONS, API_URL } from '../constants';
import type { AlertResponse, CachePayload } from '../types';

const BACKGROUND_ALERT_TASK = 'background-alert-check';
const LAST_NOTIFIED_LEVEL_KEY = 'mayon-last-notified-level';

// Configure how notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request notification permissions from the user. */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Set up the notification channel for Android. */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alert-updates', {
      name: 'Volcano Alert Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
}

/** Send a local notification when alert level changes. */
async function sendAlertNotification(newLevel: number, description: string): Promise<void> {
  const title =
    newLevel >= 3
      ? `⚠️ Alert Level ${newLevel} — Take Action`
      : `Volcano Alert Level ${newLevel}`;

  const body = description || ALERT_DESCRIPTIONS[newLevel] || `Alert level changed to ${newLevel}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: 'alert-updates' }),
    },
    trigger: null, // send immediately
  });
}

/**
 * Fetch the current alert level and notify if it changed.
 * Used by both foreground polling and background fetch.
 */
export async function checkAndNotifyAlertChange(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return false;

    const json = (await response.json()) as AlertResponse;
    const newLevel = json.alertLevel;

    // Get last notified level
    const lastStr = await AsyncStorage.getItem(LAST_NOTIFIED_LEVEL_KEY);
    const lastLevel = lastStr != null ? parseInt(lastStr, 10) : null;

    // Only notify if level actually changed (and we have a previous level to compare)
    if (lastLevel != null && newLevel !== lastLevel) {
      const desc = json.description || ALERT_DESCRIPTIONS[newLevel] || '';
      await sendAlertNotification(newLevel, desc);
    }

    // Always update the stored level
    await AsyncStorage.setItem(LAST_NOTIFIED_LEVEL_KEY, String(newLevel));

    // Also update the alert cache so the app UI stays fresh
    const normalized = {
      ...json,
      description: json.description || ALERT_DESCRIPTIONS[json.alertLevel] || 'Unknown',
    };
    await AsyncStorage.setItem(
      ALERT_CACHE_KEY,
      JSON.stringify({ data: normalized, cachedAt: new Date().toISOString() } satisfies CachePayload<AlertResponse>),
    );

    return true;
  } catch {
    return false;
  }
}

// Define the background task
TaskManager.defineTask(BACKGROUND_ALERT_TASK, async () => {
  const success = await checkAndNotifyAlertChange();
  return success
    ? BackgroundFetch.BackgroundFetchResult.NewData
    : BackgroundFetch.BackgroundFetchResult.Failed;
});

/** Register background fetch to periodically check alert level. */
export async function registerBackgroundAlertCheck(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_ALERT_TASK);
  if (isRegistered) return;

  await BackgroundFetch.registerTaskAsync(BACKGROUND_ALERT_TASK, {
    minimumInterval: 15 * 60, // 15 minutes (OS may throttle further)
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

/** Unregister background fetch. */
export async function unregisterBackgroundAlertCheck(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_ALERT_TASK);
  if (!isRegistered) return;
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_ALERT_TASK);
}

/**
 * Seed the last notified level from the current cache so we don't
 * send a spurious notification on first install.
 */
export async function seedLastNotifiedLevel(): Promise<void> {
  const existing = await AsyncStorage.getItem(LAST_NOTIFIED_LEVEL_KEY);
  if (existing != null) return; // already seeded

  const raw = await AsyncStorage.getItem(ALERT_CACHE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as CachePayload<AlertResponse>;
    await AsyncStorage.setItem(LAST_NOTIFIED_LEVEL_KEY, String(parsed.data.alertLevel));
  } catch {
    // ignore
  }
}
