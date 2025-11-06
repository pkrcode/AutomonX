import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type PhoneGps = {
  latitude: number;
  longitude: number;
  isValid: boolean;
};

/**
 * Provides the phone's current GPS position (permission-gated).
 * Falls back to null when denied or unavailable.
 */
export function usePhoneLocation(): { gps: PhoneGps | null; error?: string | null } {
  const [gps, setGps] = useState<PhoneGps | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watcher: Location.LocationSubscription | null = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setGps({ latitude: current.coords.latitude, longitude: current.coords.longitude, isValid: true });
        watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
          (pos) => setGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, isValid: true })
        );
      } catch (e: any) {
        setError(e?.message || 'Failed to get location');
      }
    })();

    return () => {
      try { watcher?.remove(); } catch {}
    };
  }, []);

  return { gps, error };
}

export default usePhoneLocation;
