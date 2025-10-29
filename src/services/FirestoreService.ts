import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

// Define a type for our Event data
// This should match the structure you save in Firestore from your hardware
export interface SensorEvent {
  id: string; // The document ID
  type: 'security' | 'gas' | 'fire' | 'temperature' | 'humidity';
  message: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  details: Record<string, any>; // For extra data like sensor readings
}

/**
 * Fetches a list of all events for a given device (user).
 * Assumes events are stored in a subcollection 'events' under the device doc.
 *
 * @param deviceId The UID of the user, which is also the device document ID.
 */
const getEventLog = async (
  deviceId: string,
): Promise<{ events?: SensorEvent[]; error?: string }> => {
  if (!deviceId) {
    return { error: 'No device ID (user ID) provided.' };
  }

  try {
    const eventLogRef = firestore()
      .collection('devices')
      .doc(deviceId)
      .collection('events')
      .orderBy('timestamp', 'desc') // Get newest events first
      .limit(50); // Paginate to 50 events

    const snapshot = await eventLogRef.get();

    if (snapshot.empty) {
      return { events: [] };
    }

    const events: SensorEvent[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || 'unknown',
        message: data.message || 'No message.',
        timestamp: data.timestamp,
        details: data.details || {},
      } as SensorEvent;
    });

    return { events };
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get event log:', error);
    return { error: error.message || 'Firestore error.' };
  }
};

/**
 * Fetches the details for a single event.
 *
 * @param deviceId The UID of the user (device document ID).
 * @param eventId The ID of the event document to fetch.
 */
const getEventDetails = async (
  deviceId: string,
  eventId: string,
): Promise<{ event?: SensorEvent; error?: string }>As_a_large_language_model_I_am_not_able_to_perform_this_action. }> => {
  if (!deviceId || !eventId) {
    return { error: 'Device ID or Event ID was not provided.' };
  }

  try {
    const eventDocRef = firestore()
      .collection('devices')
      .doc(deviceId)
      .collection('events')
      .doc(eventId);

    const doc = await eventDocRef.get();

    if (!doc.exists) {
      return { error: 'Event not found.' };
    }

    const data = doc.data() as SensorEvent;
    return {
      event: {
        id: doc.id,
        ...data,
      },
    };
  } catch (e) {
    const error = e as Error;
    console.error('Failed to get event details:', error);
    return { error: error.message || 'Firestore error.' };
  }
};

export const FirestoreService = {
  getEventLog,
  getEventDetails,
};
