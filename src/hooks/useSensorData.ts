import { useState, useEffect } from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

// Define the shape of your sensor data based on your PDF
export interface SensorData {
  temperature: number;
  humidity: number;
  gasLevel: number; // (e.g., PPM from MQ-135)
  flameDetected: boolean;
  irSensorBreach: boolean; // For your new IR security sensor
  lastUpdated: FirebaseFirestoreTypes.Timestamp;
  // You can add other fields from your PDF here
  // e.g., coLevel: number; (from MQ-7)
  // e.g., smokeLevel: number; (from MQ-2)
  // e.g., gps: { latitude: number, longitude: number };
}

/**
 * Custom hook to listen to real-time sensor data from Firestore.
 * @param docId The document ID in the 'sensors' collection to listen to.
 */
export const useSensorData = (docId: string)D => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SensorData | null>(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      setError(new Error('No document ID provided for sensor data.'));
      return;
    }

    const subscriber = firestore()
      .collection('sensors') // Collection for all sensor hubs
      .doc(docId) // The specific hub to listen to
      .onSnapshot(
        documentSnapshot => {
          if (documentSnapshot.exists) {
            const sensorData = documentSnapshot.data() as SensorData;
            setData(sensorData);
            setError(null);
          } else {
            setError(new Error('Sensor document does not exist.'));
            setData(null);
          }
          setLoading(false);
        },
        err => {
          console.error('Firestore snapshot error:', err);
          setError(err);
          setLoading(false);
        },
      );

    // Stop listening for updates when the component unmounts
    return () => subscriber();
  }, [docId]);

  return { data, loading, error };
};

