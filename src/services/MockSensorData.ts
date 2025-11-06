/**
 * Mock Sensor Data + Arduino parser
 * - parseArduinoData returns a PARTIAL SensorData (only fields present in the input)
 * - generateMockSensorData can be used for local tests
 */

import { SensorData } from '../hooks/useSensorData';

// Simulates realistic sensor readings
export const generateMockSensorData = (): SensorData => {
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

/**
 * Parse Arduino text line into a partial SensorData.
 * Example fragments it understands:
 *  - Temp1(DHT22):25.5, Humidity:60.2
 *  - Temp2(LM35):26.1
 *  - Air Quality:350.2ppm / Smoke (MQ135):350ppm
 *  - LPG/Smoke/Methane:120.5ppm / Smoke (MQ2):120ppm
 *  - CO:45.3ppm / Carbon Monoxide (MQ7):45ppm
 *  - Flame:FIRE or Flame:NO FIRE
 *  - LAT:12.345678, LON:78.912345 or Latitude:.., Longitude:..
 */
export const parseArduinoData = (dataString: string): Partial<SensorData> => {
  let s = (dataString || '').trim();
  if (!s) return {};
  if (s.startsWith('📊')) {
    const idx = s.indexOf(':');
    if (idx !== -1) s = s.slice(idx + 1).trim();
  }

  const num = (val?: string | null): number | undefined => {
    if (!val) return undefined;
    const m = String(val).match(/-?\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : undefined;
  };
  const find = (re: RegExp) => {
    const m = s.match(re);
    return m ? m[1] || m[2] || '' : '';
  };

  // Extract values (undefined if not present on this line)
  const dhtTemp = num(find(/Temp\s*\(DHT22\)\s*:\s*([^,]+)/i) || find(/Temp1\(DHT22\)\s*:\s*([^,]+)/i));
  const humidity = num(find(/Humidity\s*:\s*([^,]+)/i));
  const lm35Temp = num(find(/Temp\s*\(LM35\)\s*:\s*([^,]+)/i) || find(/Temp2\(LM35\)\s*:\s*([^,]+)/i));
  const mq135ppm = num(
    find(/Air\s*Quality[^:]*:\s*([^,]+)/i) ||
      find(/Air\s*\(CO2\/?NH3\/?Benzene\)\s*:\s*([^,]+)/i) ||
      find(/Smoke\s*\(MQ135\)\s*:\s*([^,]+)/i)
  );
  const mq2ppm = num(
    find(/(Smoke|LPG|Methane)[^:]*\(MQ2\)\s*:\s*([^,]+)/i) ||
    find(/LPG\/Smoke\/Methane\s*:\s*([^,]+)/i) ||
    find(/Flam(?:m)?able\s*gases\s*\(MQ2\)\s*:\s*([^,]+)/i)
  );
  // Textual detection fallback (when no PPM number is printed)
  let mq2DetectedText: boolean | undefined = undefined;
  if (mq2ppm === undefined) {
    const hasMq2Keywords = /(lpg|smoke|methane|gas)/i.test(s);
    if (hasMq2Keywords) {
      if (/(detected|yes|on|1|true|hazard|alert)/i.test(s) && !/(no\s*detected|clear|safe|none|no|off|0|false)/i.test(s)) {
        mq2DetectedText = true;
      } else if (/(clear|safe|none|no|off|0|false)/i.test(s)) {
        mq2DetectedText = false;
      }
    }
  }
  const mq7ppm = num(find(/Carbon\s*Monoxide[^:]*\(MQ7\)\s*:\s*([^,]+)/i) || find(/\bCO\b\s*:\s*([^,]+)/i));
  const flameField = find(/Flame\s*:\s*([^,]+)/i);
  const hasFlame = !!flameField;
  const flameDetected = hasFlame ? (/\bFIRE\b/i.test(flameField) && !/NO\s*FIRE/i.test(flameField)) : undefined;

  // GPS: support Lat/Lon, LAT/LON, Latitude/Longitude
  const lat = num(find(/Lat\s*:\s*([^,]+)/i) || find(/LAT\s*:\s*([^,]+)/i) || find(/Latitude\s*:\s*([^,]+)/i));
  const lon = num(find(/Lon\s*:\s*([^,]+)/i) || find(/LON\s*:\s*([^,]+)/i) || find(/Longitude\s*:\s*([^,]+)/i));
  const hasLat = lat !== undefined;
  const hasLon = lon !== undefined;

  // IR / Motion / Security breach detection
  const irField = (find(/\bIR\b\s*:\s*([^,]+)/i))
    || (find(/\bPIR\b\s*:\s*([^,]+)/i))
    || (find(/\bMotion\b\s*:\s*([^,]+)/i))
    || (find(/\bSecurity\b\s*:\s*([^,]+)/i));
  let hasIr = false;
  let irBreach: boolean | undefined = undefined;
  if (irField) {
    const t = irField.trim().toLowerCase();
    hasIr = true;
    if (/(breach|detected|intrud|trigger|alarm|yes|on|1|true)/.test(t) && !/(clear|safe|none|no|off|0|false)/.test(t)) {
      irBreach = true;
    } else if (/(clear|safe|none|no|off|0|false)/.test(t)) {
      irBreach = false;
    }
  }

  // Build a partial object ONLY with present fields so we never wipe previous values.
  const out: Partial<SensorData> = {};
  if (dhtTemp !== undefined || humidity !== undefined) {
    out.dht22 = {} as any;
    if (dhtTemp !== undefined) (out.dht22 as any).temperature = dhtTemp;
    if (humidity !== undefined) (out.dht22 as any).humidity = humidity;
  }
  if (lm35Temp !== undefined) out.lm35 = { temperature: lm35Temp };
  if (mq135ppm !== undefined) out.mq135 = { airQualityPPM: mq135ppm };
  if (mq2ppm !== undefined || mq2DetectedText !== undefined) {
    const gasDetected = mq2DetectedText !== undefined ? mq2DetectedText : (mq2ppm! > 100);
    out.mq2 = { gasDetected, ...(mq2ppm !== undefined ? { lpgPPM: mq2ppm } : {}) } as any;
  }
  if (mq7ppm !== undefined) out.mq7 = { coPPM: mq7ppm };
  if (hasFlame) out.flame = { detected: !!flameDetected };
  if (hasLat || hasLon) out.gps = { latitude: lat ?? 0, longitude: lon ?? 0, isValid: hasLat && hasLon };
  if (hasIr && irBreach !== undefined) {
    out.irSensor = { breach: irBreach };
  }
  return out;
};
