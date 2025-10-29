import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';

/**
 * Requests permission from the user to send push notifications.
 * This is required for iOS and recommended for Android 13+.
 */
const requestUserPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification Authorization status:', authStatus);
      return true;
    }
  } else {
    // Android permissions are generally granted by default,
    // but Android 13+ requires explicit permission.
    // The @react-native-firebase/messaging library handles this.
    // We can just assume success for simplicity here,
    // or add a check with 'PermissionsAndroid' if needed.
    return true;
  }
  return false;
};

/**
 * Gets the device's FCM token and saves it to Firestore
 * associated with the given user ID.
 *
 * @param userId The UID of the logged-in user.
 */
const getAndSaveToken = async (userId: string): Promise<void> => {
  if (!userId) {
    console.error('No user ID provided, cannot save FCM token.');
    return;
  }

  try {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log('User has not granted notification permissions.');
      return;
    }

    // Get the FCM token
    const token = await messaging().getToken();

    if (token) {
      console.log('Device FCM Token:', token);

      // Save the token to Firestore
      // We store tokens in a subcollection so a user can have multiple devices.
      // The document ID is the token itself to prevent duplicates.
      const tokenRef = firestore()
        .collection('devices')
        .doc(userId)
        .collection('fcmTokens')
        .doc(token);

      await tokenRef.set({
        token: token,
        createdAt: firestore.FieldValue.serverTimestamp(),
        platform: Platform.OS,
      });

      console.log('FCM Token saved to Firestore for user:', userId);
    }
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get or save FCM token:', error);
  }
};

/**
 * Sets up a listener for when a notification is received
 * while the app is in the foreground.
 */
const listenForNotifications = (): (() => void) => {
  const unsubscribe = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('A new FCM message arrived in the foreground!', remoteMessage);
      // Here you would show an in-app notification/alert
      // e.g., using a library like 'react-native-flash-message'
      // alert(remoteMessage.notification?.title || 'New Alert');
    },
  );

  return unsubscribe;
};

export const NotificationService = {
  requestUserPermission,
  getAndSaveToken,
  listenForNotifications,
};
