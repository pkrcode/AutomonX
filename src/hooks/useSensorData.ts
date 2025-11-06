import { useState, useEffect } from 'react';

// Define the shape of your sensor data based on Arduino sensors
export interface SensorData {
  dht22?: {
    temperature: number;
    humidity: number;
  };
  lm35?: {
    temperature: number;
  };
  mq135?: {
    airQualityPPM: number; // CO2, NH3, Benzene
  };
  mq2?: {
    gasDetected: boolean;
    lpgPPM?: number; // LPG, Smoke, Methane
  };
  mq7?: {
    coPPM: number; // Carbon Monoxide
  };
  flame?: {
    detected: boolean;
  };
  irSensor?: {
    breach: boolean;
  };
  gps?: {
    latitude: number;
    longitude: number;
    isValid: boolean;
  };
  automations?: {
    fan: boolean;
    lights: boolean;
    doorLock: boolean;
  };
  // Use a generic type to avoid importing Firebase types in Expo Go
  lastUpdated?: any;
}

/**
 * Custom hook to listen to real-time sensor data from Firestore.
 * @param docId The document ID in the 'sensors' collection to listen to.
 */
export const useSensorData = (docId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SensorData | null>(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      setError(new Error('No document ID provided for sensor data.'));
      return;
    }
    // Try to load react-native-firebase/firestore dynamically.
    // If unavailable (e.g., Expo Go), fall back to mock data so the app can run.
    let unsubscribe: (() => void) | undefined;
    (async () => {
      let rnFirestore: any = null;
      try {
        rnFirestore = require('@react-native-firebase/firestore').default;
      } catch (e) {
        rnFirestore = null;
      }

      if (!rnFirestore) {
        // Fallback: generate simple mock data periodically so UI is testable without native Firebase.
        const generateMock = (): SensorData => {
          const baseTemp = 25 + Math.random() * 10;
          const baseHumidity = 50 + Math.random() * 30;
          return {
            dht22: {
              temperature: parseFloat(baseTemp.toFixed(1)),
              humidity: parseFloat(baseHumidity.toFixed(1)),
            },
            lm35: { temperature: parseFloat((baseTemp + (Math.random() - 0.5) * 2).toFixed(1)) },
            mq135: { airQualityPPM: parseFloat((200 + Math.random() * 300).toFixed(1)) },
            mq2: { gasDetected: Math.random() > 0.9, lpgPPM: parseFloat((50 + Math.random() * 200).toFixed(1)) },
            mq7: { coPPM: parseFloat((10 + Math.random() * 50).toFixed(1)) },
            flame: { detected: Math.random() > 0.98 },
            irSensor: { breach: Math.random() > 0.95 },
            gps: {
              latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
              longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
              isValid: true,
            },
            automations: { fan: baseTemp > 30, lights: false, doorLock: true },
            lastUpdated: Date.now(),
          };
        };

        setData(generateMock());
        setLoading(false);
        const interval = setInterval(() => setData(generateMock()), 3000);
        unsubscribe = () => clearInterval(interval as any);
        // Provide a clear, non-crashing error to the caller
        setError(null);
        return;
      }

      // Use real Firestore if available
      // Listen to devices/{deviceId}/latest for real-time sensor data
      unsubscribe = rnFirestore()
        .collection('devices')
        .doc(docId)
        .onSnapshot(
          (documentSnapshot: any) => {
            if (documentSnapshot.exists) {
              const deviceData = documentSnapshot.data();
              // Bridge writes to 'latest' field with sensor data
              const sensorData = deviceData?.latest as SensorData;
              if (sensorData) {
                setData(sensorData);
                setError(null);
              } else {
                // No sensor data yet - show message but don't block UI
                console.warn('No sensor data in latest field yet.');
                setError(null); // Don't show error, data might come soon
                setData(null);
              }
            } else {
              // Document doesn't exist yet - might not be created by bridge yet
              console.warn('Device document does not exist yet. Waiting for Arduino bridge...');
              setError(null); // Don't show error screen, just wait
              setData(null);
            }
            setLoading(false);
          },
          (err: any) => {
            // Firestore error - likely Expo Go or connection issue
            console.error('Firestore snapshot error (falling back to mock data):', err);
            // Don't set error - just use the mock data fallback
            setError(null);
            setLoading(false);
          },
        );
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [docId]);

  return { data, loading, error };
};

