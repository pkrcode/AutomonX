// Enhanced shim for @react-native-firebase/firestore to run in Expo Go
// Provides an in-memory store with a minimal subset of Firestore APIs used by the app.

export namespace FirebaseFirestoreTypes {
  export class Timestamp {
    toDate(): Date { return new Date(); }
    toMillis(): number { return Date.now(); }
  }
}

type Listener = (snap: any) => void;

// In-memory database shape:
// devices/{docId}: { latest: SensorDataLike, automations?: { fan, lights, doorLock, sprinkler? } }
const DB: Record<string, any> = {};
const LISTENERS: Record<string, Set<Listener>> = {};

const ensureDevice = (docId: string) => {
  if (!DB[docId]) {
    const baseTemp = 25 + Math.random() * 10;
    DB[docId] = {
      latest: {
        dht22: { temperature: parseFloat(baseTemp.toFixed(1)), humidity: parseFloat((50 + Math.random() * 30).toFixed(1)) },
        lm35: { temperature: parseFloat((baseTemp + (Math.random() - 0.5) * 2).toFixed(1)) },
        mq135: { airQualityPPM: parseFloat((200 + Math.random() * 300).toFixed(1)) },
        mq2: { gasDetected: Math.random() > 0.9, lpgPPM: parseFloat((50 + Math.random() * 200).toFixed(1)) },
        mq7: { coPPM: parseFloat((10 + Math.random() * 50).toFixed(1)) },
        flame: { detected: Math.random() > 0.98 },
        irSensor: { breach: Math.random() > 0.95 },
        gps: { latitude: 12.9716, longitude: 77.5946, isValid: true },
        automations: { fan: false, lights: false, doorLock: true, sprinkler: false },
        lastUpdated: Date.now(),
      },
      automations: { fan: false, lights: false, doorLock: true, sprinkler: false },
    };
  }
};

const notify = (docId: string) => {
  const ls = LISTENERS[docId];
  if (!ls) return;
  const snap = {
    exists: true,
    data: () => ({ ...DB[docId] }),
  };
  ls.forEach(fn => fn(snap));
};

// Periodically update sensor values for realism
setInterval(() => {
  Object.keys(DB).forEach((docId) => {
    const latest = DB[docId]?.latest;
    if (!latest) return;
    latest.dht22.temperature = parseFloat((latest.dht22.temperature + (Math.random() - 0.5) * 0.6).toFixed(1));
    latest.dht22.humidity = parseFloat((latest.dht22.humidity + (Math.random() - 0.5) * 2).toFixed(1));
    latest.lm35.temperature = parseFloat((latest.lm35.temperature + (Math.random() - 0.5) * 0.6).toFixed(1));
    latest.mq135.airQualityPPM = parseFloat((latest.mq135.airQualityPPM + (Math.random() - 0.5) * 10).toFixed(1));
    latest.mq2.lpgPPM = Math.max(0, parseFloat(((latest.mq2.lpgPPM || 100) + (Math.random() - 0.5) * 10).toFixed(1)));
    latest.mq2.gasDetected = (latest.mq2.lpgPPM || 0) > 150;
    latest.mq7.coPPM = Math.max(0, parseFloat((latest.mq7.coPPM + (Math.random() - 0.5) * 5).toFixed(1)));
    latest.flame.detected = Math.random() > 0.995 ? !latest.flame.detected : latest.flame.detected;
    latest.lastUpdated = Date.now();
    notify(docId);
  });
}, 3000);

const firestore = () => ({
  __isShim: true,
  collection: (name: string) => {
    return {
      doc: (docId: string) => {
        return {
          onSnapshot: (next: Listener, _error?: (e: any) => void) => {
            if (name !== 'devices') {
              const t = setTimeout(() => next({ exists: false, data: () => ({}) }), 0);
              return () => clearTimeout(t);
            }
            ensureDevice(docId);
            if (!LISTENERS[docId]) LISTENERS[docId] = new Set();
            LISTENERS[docId].add(next);
            // Fire initial snapshot
            setTimeout(() => notify(docId), 0);
            return () => { LISTENERS[docId].delete(next); };
          },
          update: async (updates: Record<string, any>) => {
            ensureDevice(docId);
            // Support dotted paths like automations.fan
            Object.keys(updates).forEach((path) => {
              const value = updates[path];
              const parts = path.split('.');
              // update root
              let ref = DB[docId];
              for (let i = 0; i < parts.length - 1; i++) {
                ref[parts[i]] = ref[parts[i]] ?? {};
                ref = ref[parts[i]];
              }
              ref[parts[parts.length - 1]] = value;
              // mirror into latest as well for UI
              ref = DB[docId].latest;
              for (let i = 0; i < parts.length - 1; i++) {
                ref[parts[i]] = ref[parts[i]] ?? {};
                ref = ref[parts[i]];
              }
              ref[parts[parts.length - 1]] = value;
            });
            notify(docId);
            return { ok: true };
          },
          set: async (data: any, options?: { merge?: boolean }) => {
            ensureDevice(docId);
            if (options?.merge) {
              DB[docId] = { ...DB[docId], ...data };
            } else {
              DB[docId] = data;
            }
            notify(docId);
            return { ok: true };
          },
          get: async () => {
            ensureDevice(docId);
            return { exists: true, data: () => ({ ...DB[docId] }) };
          },
        };
      },
    };
  },
});

export default firestore as any;
