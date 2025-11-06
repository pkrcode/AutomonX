import React, { useContext, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainDrawerParamList } from '@navigation/MainDrawer';

// Import components and constants using path aliases
import Header from '@components/common/Header';
import SensorCard from '@components/dashboard/SensorCard';
import SecurityStatus from '@components/dashboard/SecurityStatus';
import FanControl from '@components/controls/FanControl';
import LightControl from '@components/controls/LightControl';
import DoorControl from '@components/controls/DoorControl';
import SprinklerControl from '@components/controls/SprinklerControl';
import { useThemeColors } from '../../constants/colors';

// Import hooks and context using path aliases
import { useSensorData } from '@hooks/useSensorData';
import { useAutomationRules } from '@hooks/useAutomationRules';
import { usePhoneLocation } from '@hooks/usePhoneLocation';
import { useArduinoWebSocket } from '@hooks/useArduinoWebSocket';
import { AuthContext } from '@context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext_Simple';

// Import services using path aliases
import DeviceControlService from '@services/DeviceControlService';

type DashboardScreenProps = NativeStackScreenProps<MainDrawerParamList, 'Dashboard'>;

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const settings = useContext(SettingsContext);

  // Get deviceId from user or use default
  const deviceId = auth?.user?.uid || 'default-device';

  // WebSocket URL and enable flag come from Settings screen
  const wsUrl = settings?.settings.arduino.websocketUrl || null;
  const wsEnabled = !!settings?.settings.arduino.enabled;
  const { latest: wsData, status: wsStatus, lastLine: wsLastLine, lastMessageAt } = useArduinoWebSocket(wsEnabled ? wsUrl : null, wsEnabled);

  // Also try Firebase (won't work in Expo Go, but will work in standalone build)
  const { data: firebaseData } = useSensorData(deviceId);
  // Phone GPS fallback when Arduino GPS not available
  const { gps: phoneGps } = usePhoneLocation();

  // Use WebSocket data if available (real-time), otherwise fall back to Firebase or mock
  // Prefer WebSocket data when enabled; otherwise use Firebase/mock
  const baseData = wsEnabled ? wsData : (wsData || firebaseData);
  // Memoize merged data so object identity is stable and does not trigger infinite re-renders
  const data = useMemo(() => {
    if (!baseData) return baseData;
    const needsPhoneGps = !baseData.gps?.isValid && !!phoneGps;
    if (needsPhoneGps) {
      return {
        ...baseData,
        gps: { latitude: phoneGps!.latitude, longitude: phoneGps!.longitude, isValid: true },
      };
    }
    return baseData;
  }, [baseData, phoneGps?.latitude, phoneGps?.longitude, baseData?.gps?.isValid]);

  // Extra safety: retain last good values so UI never drops to 0 between updates
  type SD = typeof data;
  const lastStableRef = useRef<SD | null>(null);
  const deepMergePartial = (prev: any, next: any) => {
    const out: any = { ...(prev || {}) };
    if (!next) return out;
    if (next.dht22) out.dht22 = { ...(prev?.dht22 || {}), ...next.dht22 };
    if (next.lm35?.temperature !== undefined) out.lm35 = { temperature: next.lm35.temperature };
    if (next.mq135?.airQualityPPM !== undefined) out.mq135 = { airQualityPPM: next.mq135.airQualityPPM };
    if (next.mq2 && (next.mq2.lpgPPM !== undefined || next.mq2.gasDetected !== undefined)) {
      out.mq2 = { ...(prev?.mq2 || {}), ...next.mq2 };
    }
    if (next.mq7?.coPPM !== undefined) out.mq7 = { coPPM: next.mq7.coPPM };
    if (next.flame && next.flame.detected !== undefined) out.flame = { detected: next.flame.detected };
    if (next.gps) out.gps = next.gps; // already validated above
    if (next.irSensor) out.irSensor = { ...(prev?.irSensor || {}), ...next.irSensor };
    if (next.automations) out.automations = { ...(prev?.automations || {}), ...next.automations };
    out.lastUpdated = next.lastUpdated ?? prev?.lastUpdated ?? Date.now();
    return out;
  };

  useEffect(() => {
    if (data) {
      lastStableRef.current = deepMergePartial(lastStableRef.current, data) as SD;
    }
  }, [data]);

  const display = lastStableRef.current || data;

  // Handle automation toggles
  const handleToggle = (automationId: string, value: boolean) => {
    console.log(`Toggling ${automationId} to ${value}`);
    DeviceControlService.updateAutomation(deviceId, automationId, value);
  };

  // Don't show loading screen forever - just show the connection status banner
  // The useSensorData hook will provide mock data if Firebase is unavailable

  // Don't block UI if no data yet; use safe defaults below (mock will fill shortly)

  // Use automation rules to compute immediate states for UI and hazards
  const rules = useAutomationRules(deviceId, display as any);
  // Extract specific sensor data from Firebase
  // Derive security status: explicit breach OR hazard from rules triggers breach view
  const isHazard = !!(rules?.hazards?.mq2 || rules?.hazards?.co || rules?.hazards?.flame);
  const securityStatus = (display?.irSensor?.breach ?? false) || isHazard;
  const securityMsg = securityStatus
    ? (rules?.hazards?.flame
        ? 'Evacuate: Fire detected'
        : (rules?.hazards?.mq2
            ? 'Evacuate: Gas detected'
            : (rules?.hazards?.co
                ? 'Evacuate: CO detected'
                : ((display?.irSensor?.breach ?? false) ? 'Intrusion detected' : undefined))))
    : undefined;
  const temperatureDHT = display?.dht22?.temperature ?? 0;
  const temperatureLM35 = display?.lm35?.temperature ?? 0;
  const humidity = display?.dht22?.humidity ?? 0;
  const airQuality = display?.mq135?.airQualityPPM ?? 0;
  const gasDetected = display?.mq2?.gasDetected ?? false;
  const lpgPPM = display?.mq2?.lpgPPM ?? 0;
  const coPPM = display?.mq7?.coPPM ?? 0;
  const flameDetected = display?.flame?.detected ?? false;
  const gpsLocation = display?.gps?.isValid 
    ? `${display.gps.latitude.toFixed(6)}, ${display.gps.longitude.toFixed(6)}`
    : 'No GPS Fix';

  // Preview overrides disabled for live rule testing
  const PREVIEW_ALL_ON = false;
  const PREVIEW_ALL_OFF = false;
  // Door: locked when OFF preview, unlocked when ON preview
  const doorLocked = PREVIEW_ALL_OFF ? true : PREVIEW_ALL_ON ? false : (rules?.automations?.doorLock ?? display?.automations?.doorLock ?? true);
  const fanOn = PREVIEW_ALL_OFF ? false : PREVIEW_ALL_ON ? true : (rules?.automations?.fan ?? display?.automations?.fan ?? false);
  const lightsOn = PREVIEW_ALL_OFF ? false : PREVIEW_ALL_ON ? true : (rules?.automations?.lights ?? display?.automations?.lights ?? false);
  const sprinklerOn = PREVIEW_ALL_OFF ? false : PREVIEW_ALL_ON ? true : (rules?.automations?.sprinkler ?? (display as any)?.automations?.sprinkler ?? false);
  // Theme
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="AutoMonX"
        rightIcon="settings"
        onRightPress={() => navigation.navigate('Settings')}
        onLogoPress={() => navigation.navigate('Dashboard')}
      />
  <ScrollView style={styles.scrollBackground} contentContainerStyle={styles.scrollContainer}>
        {/* Tiny connection chip for Arduino bridge */}
        <View style={[styles.connChip, { backgroundColor: wsEnabled ? (wsStatus === 'connected' ? '#E6FFF2' : wsStatus === 'error' ? '#FFEAEA' : '#F0F4FF') : '#F7F7F7' }]}>
          <View style={[styles.dot, { backgroundColor: wsEnabled ? (wsStatus === 'connected' ? '#16a34a' : wsStatus === 'error' ? '#dc2626' : '#64748b') : '#9ca3af' }]} />
          <View>
            <Text style={styles.connText}>
              {wsEnabled ? `Bridge: ${wsStatus}  •  ${wsUrl}` : 'Bridge disabled • Enable in Settings'}
            </Text>
            {wsEnabled && wsStatus === 'connected' && (
              <Text style={[styles.connText, { fontSize: 11, opacity: 0.7 }]}>Src: WebSocket • Last msg {lastMessageAt ? new Date(lastMessageAt).toLocaleTimeString() : '—'}</Text>
            )}
            {!wsEnabled && (
              <Text style={[styles.connText, { fontSize: 11, opacity: 0.7 }]}>Src: {firebaseData ? 'Firebase/Mock' : '—'}</Text>
            )}
          </View>
        </View>
        {wsEnabled && wsStatus === 'connected' && wsLastLine ? (
          <Text style={[styles.helpText, { marginBottom: 8 }]}>Last line: {wsLastLine}</Text>
        ) : null}

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
  <SecurityStatus isBreached={securityStatus} message={securityMsg} />

        {/* Controls in a 2-column grid */}
        <Text style={styles.sectionTitle}>Controls</Text>
        <Text
          onPress={() => navigation.navigate('ControlsDemo')}
          style={[styles.helpText, { marginBottom: 8, textDecorationLine: 'underline' }]}
        >
          Open Controls Animation Demo →
        </Text>
        <View style={styles.controlsGrid}>
          <FanControl isOn={fanOn} onToggle={value => handleToggle('fan', value)} style={{ flexBasis: '48%' }} />
          <LightControl isOn={lightsOn} onToggle={value => handleToggle('lights', value)} style={{ flexBasis: '48%' }} />
          <DoorControl isLocked={doorLocked} onToggle={value => handleToggle('doorLock', value)} style={{ flexBasis: '48%' }} />
          <SprinklerControl isOn={sprinklerOn} onToggle={value => handleToggle('sprinkler', value)} style={{ flexBasis: '48%' }} />
        </View>

        {/* Sensors Section */}
        <Text style={styles.sectionTitle}>Live Sensors</Text>
        <View style={styles.cardRow}>
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="Temp (DHT22)"
            value={`${temperatureDHT.toFixed(1)}°C`}
            unit="°C"
            status={temperatureDHT > 35 ? 'danger' : temperatureDHT > 30 ? 'warning' : 'normal'}
          />
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="Temp (LM35)"
            value={`${temperatureLM35.toFixed(1)}°C`}
            unit="°C"
            status={temperatureLM35 > 35 ? 'danger' : temperatureLM35 > 30 ? 'warning' : 'normal'}
          />
        </View>
        <View style={styles.cardRow}>
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="Humidity"
            value={`${humidity.toFixed(1)}`}
            unit="%"
            status={humidity > 80 ? 'warning' : 'normal'}
          />
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="Air Quality"
            value={`${airQuality.toFixed(0)}`}
            unit="PPM"
            status={airQuality > 400 ? 'danger' : airQuality > 300 ? 'warning' : 'normal'}
          />
        </View>
        <View style={styles.cardRow}>
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="LPG/Smoke"
            value={gasDetected ? `${lpgPPM.toFixed(0)}` : 'Clear'}
            unit={gasDetected ? 'PPM' : ''}
            status={gasDetected ? 'danger' : 'normal'}
          />
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="CO Level"
            value={`${coPPM.toFixed(0)}`}
            unit="PPM"
            status={coPPM > 50 ? 'danger' : coPPM > 30 ? 'warning' : 'normal'}
          />
        </View>
        <View style={styles.cardRow}>
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="Flame"
            value={flameDetected ? '🔥 FIRE!' : '✓ Clear'}
            unit=""
            status={flameDetected ? 'danger' : 'normal'}
          />
          <SensorCard
            style={{ flexBasis: '48%' }}
            title="GPS"
            value={gpsLocation}
            unit=""
            status="normal"
          />
        </View>

        {/* End Controls */}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollBackground: {
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 15,
  },
  statusBanner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d1d6',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusHelp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 15,
    marginBottom: 10,
  },
  connChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  connText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  devPanel: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
  },
  devTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  devInput: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  devButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  devButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  devLabel: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default DashboardScreen;
