import React, { useContext, useMemo } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ScrollView } from 'react-native';
import FanControl from '@components/controls/FanControl';
import LightControl from '@components/controls/LightControl';
import DoorControl from '@components/controls/DoorControl';
import SprinklerControl from '@components/controls/SprinklerControl';
import Header from '@components/common/Header';
import { useThemeColors } from '../../constants/colors';
import { AuthContext } from '@context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext_Simple';
import { useArduinoWebSocket } from '@hooks/useArduinoWebSocket';
import { useSensorData } from '@hooks/useSensorData';
import { useAutomationRules } from '@hooks/useAutomationRules';
import DeviceControlService from '@services/DeviceControlService';

const ControlsAnimationDemo: React.FC<any> = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const auth = useContext(AuthContext);
  const settings = useContext(SettingsContext);
  const deviceId = auth?.user?.uid || 'default-device';

  const wsUrl = settings?.settings.arduino.websocketUrl || null;
  const wsEnabled = !!settings?.settings.arduino.enabled;
  const { latest: wsData, status: wsStatus } = useArduinoWebSocket(wsEnabled ? wsUrl : null, wsEnabled);
  const { data: firebaseData } = useSensorData(deviceId);

  const data = useMemo(() => (wsEnabled ? (wsData || firebaseData) : (wsData || firebaseData)), [wsEnabled, wsData, firebaseData]);
  const rules = useAutomationRules(deviceId, data as any);
  const isHazard = !!(rules?.hazards?.mq2 || rules?.hazards?.co || rules?.hazards?.flame);
  const fanOn = rules?.automations?.fan ?? data?.automations?.fan ?? false;
  const lightsOn = rules?.automations?.lights ?? data?.automations?.lights ?? false;
  const sprinklerOn = rules?.automations?.sprinkler ?? (data as any)?.automations?.sprinkler ?? false;
  // Unlock on hazard or breach to visualize evacuation
  const doorLocked = rules?.automations?.doorLock ?? (isHazard || (data?.irSensor?.breach ?? false) ? false : (data?.automations?.doorLock ?? true));

  const onToggle = (key: 'fan' | 'lights' | 'doorLock' | 'sprinkler', value: boolean) => {
    DeviceControlService.updateAutomation(deviceId, key, value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Controls Animation Demo"
        rightIcon="settings"
        onRightPress={() => navigation.navigate('Settings')}
        onLogoPress={() => navigation.navigate('Dashboard')}
      />
      <ScrollView style={styles.scrollBackground} contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.help}>Live source: {wsEnabled ? `WebSocket (${wsStatus})` : 'Firebase/Mock'}</Text>
        { (isHazard || (data?.irSensor?.breach ?? false)) && (
          <View style={[styles.banner, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <Text style={[styles.bannerText, { color: '#991B1B' }]}>Evacuate now: Hazard detected • Door unlocked • Security Breach</Text>
          </View>
        )}
        <Text style={styles.sectionTitle}>Connected Controls</Text>
        <View style={styles.controlsGrid}>
          <FanControl style={{ flexBasis: '48%' }} isOn={fanOn} onToggle={(v) => onToggle('fan', v)} />
          <LightControl style={{ flexBasis: '48%' }} isOn={lightsOn} onToggle={(v) => onToggle('lights', v)} />
          <DoorControl style={{ flexBasis: '48%' }} isLocked={doorLocked} onToggle={(v) => onToggle('doorLock', v)} />
          <SprinklerControl style={{ flexBasis: '48%' }} isOn={sprinklerOn} onToggle={(v) => onToggle('sprinkler', v)} />
        </View>
        <View style={styles.noteBox}>
          <Text style={styles.note}>
            This demo shows all four component animations responding to your live sensor-driven automations. Try changing gas, CO, or flame conditions to see Fan/Lights/Sprinkler react. Security breach will unlock the door briefly to visualize the door swing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollBackground: { backgroundColor: colors.background },
  scrollContainer: { padding: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginTop: 12, marginBottom: 10 },
  controlsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  help: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
    banner: { padding: 10, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, marginBottom: 10 },
    bannerText: { fontSize: 13, fontWeight: '700' },
  noteBox: { marginTop: 16, backgroundColor: colors.card, borderRadius: 10, padding: 12 },
  note: { fontSize: 13, color: colors.textSecondary },
});

export default ControlsAnimationDemo;
