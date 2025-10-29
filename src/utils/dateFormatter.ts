import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/**
 * Formats a Firestore Timestamp into a readable string.
 * Example: "Oct 29, 2025, 2:30 PM"
 *
 * @param timestamp The Firestore Timestamp object.
 * @returns A formatted date and time string.
 */
export const formatTimestamp = (
  timestamp: FirebaseFirestoreTypes.Timestamp,
): string => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return 'Invalid date';
  }

  try {
    const date = timestamp.toDate();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-US', options);
  } catch (e) {
    console.error('Failed to format timestamp:', e);
    return 'Invalid date';
  }
};
