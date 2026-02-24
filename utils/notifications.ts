import { Platform } from 'react-native';

let Notifications: any = null;
let Device: any = null;

if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  // Set how notifications are handled when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Registers for push notifications and returns the push token.
 * We primarily need this to ask for permissions and set up Android channels for local notifications.
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return false;

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true; // Permissions granted
  } else {
    console.log('Must use physical device for Push Notifications');
    return false; // Typically works on iOS simulator for local, but good to check
  }
}

/**
 * Schedules a local notification for an event
 * @param title Event title
 * @param body Notification body (e.g., "Starts in 1 hour!")
 * @param triggerDate The exact Date object when this should fire
 * @param data Optional data to pass to the notification (like event ID to navigate to)
 * @returns The scheduled notification identifier (string)
 */
export async function scheduleEventReminder(
  title: string,
  body: string,
  triggerDate: Date,
  data?: any
) {
  if (Platform.OS === 'web') return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: {
        // Expo types require this format for exact dates
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return identifier;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

/**
 * Cancels a specific scheduled notification
 * @param identifier The notification identifier to cancel
 */
export async function cancelEventReminder(identifier: string) {
  if (Platform.OS === 'web') return false;

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    return true;
  } catch (error) {
    console.error("Error canceling notification:", error);
    return false;
  }
}
