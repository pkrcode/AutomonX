import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainDrawerParamList } from '@navigation/MainDrawer';

// Import components and constants using path aliases
import Header from '@components/common/Header';
import { useThemeColors } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';

// Import contexts
import { AuthContext } from '@context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext_Simple';
import { AuthService } from '@services/AuthService';

type SettingsScreenProps = NativeStackScreenProps<MainDrawerParamList, 'Settings'>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const settings = useContext(SettingsContext);
  
  const [wsUrl, setWsUrl] = useState(settings?.settings.arduino.websocketUrl || 'ws://192.168.1.100:3001');

  if (!settings) {
    // This should not happen if App.tsx is set up correctly
    return null;
  }

  const { settings: appSettings, setTheme, toggleNotifications, setArduinoEnabled, setArduinoUrl } = settings;
  const isDarkMode = appSettings.theme === 'dark';

  const handleToggleDarkMode = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleToggleArduino = (value: boolean) => {
    if (value && !wsUrl.trim()) {
      Alert.alert('Error', 'Please enter a WebSocket URL first');
      return;
    }
    setArduinoEnabled(value);
  };

  const handleSaveWsUrl = () => {
    if (!wsUrl.trim()) {
      Alert.alert('Error', 'WebSocket URL cannot be empty');
      return;
    }
    if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      Alert.alert('Invalid URL', 'WebSocket URL must start with ws:// or wss://');
      return;
    }
    setArduinoUrl(wsUrl);
    Alert.alert('Success', 'WebSocket URL saved! Toggle connection to apply.');
  };

  const handleTestBridge = async () => {
    if (!wsUrl.trim()) {
      Alert.alert('Error', 'Enter a WebSocket URL first');
      return;
    }
    try {
      const httpUrl = wsUrl
        .replace(/^wss:\/\//i, 'https://')
        .replace(/^ws:\/\//i, 'http://')
        .replace(/\/$/, '') + '/health';
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(httpUrl, { signal: ctrl.signal });
      clearTimeout(t);
      const ok = res.ok;
      const txt = await res.text();
      if (ok) {
        Alert.alert('Bridge OK', `Health responded at ${httpUrl}:\n${txt}`);
      } else {
        Alert.alert('Bridge responded with error', `Status ${res.status} at ${httpUrl}:\n${txt}`);
      }
    } catch (e: any) {
      Alert.alert('Bridge not reachable', `${e?.message || e} \n\nTips:\n• Phone and PC must be on the same network (Wi‑Fi/hotspot)\n• Use your PC IP (e.g., ws://192.168.XX.YY:3001)\n• Allow Windows Firewall for Node/Python\n• For USB, run adb reverse and use ws://localhost:3001`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            AuthService.signOut();
          },
        },
      ]
    );
  };

  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Settings"
        leftIcon="settings"
        rightIcon="close"
        onRightPress={() => navigation.goBack()}
      />
  <ScrollView style={styles.scrollBackground} contentContainerStyle={styles.scrollContainer}>
        {/* Arduino Connection */}
        <Text style={styles.sectionTitle}>🔌 Arduino Connection</Text>
        <View style={[styles.settingItem, globalStyles.cardShadow]}>
          <Text style={styles.settingLabel}>Enable Arduino Connection</Text>
          <Switch
            trackColor={{ false: colors.textSecondary, true: colors.success }}
            thumbColor={appSettings.arduino.enabled ? colors.success : (isDarkMode ? colors.gray : colors.lightGray)}
            onValueChange={handleToggleArduino}
            value={appSettings.arduino.enabled}
          />
        </View>
        
        <View style={[styles.urlInputContainer, globalStyles.cardShadow]}>
          <Text style={[styles.settingLabel, { marginBottom: 8 }]}>WebSocket URL</Text>
          <TextInput
            style={styles.urlInput}
            value={wsUrl}
            onChangeText={setWsUrl}
            placeholder="ws://192.168.1.100:3001"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveWsUrl}>
            <Text style={styles.saveButtonText}>Save URL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.secondary }]} onPress={handleTestBridge}>
            <Text style={styles.saveButtonText}>Test Bridge</Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            💡 Tip: Run 'npm run py-bridge' on your PC, then enter: ws://YOUR_PC_IP:3001
          </Text>
        </View>

        {/* App Settings */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={[styles.settingItem, globalStyles.cardShadow]}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor={isDarkMode ? colors.gray : colors.lightGray}
            onValueChange={handleToggleDarkMode}
            value={isDarkMode}
          />
        </View>
        <View style={[styles.settingItem, globalStyles.cardShadow]}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          {/* This toggle would be wired up to SettingsContext */}
          <Switch
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor={isDarkMode ? colors.gray : colors.lightGray}
            onValueChange={() => toggleNotifications('alerts')}
            value={appSettings.notificationsEnabled.alerts}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={[styles.settingItem, globalStyles.cardShadow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text style={[styles.settingLabel, { marginBottom: 6 }]}>Project</Text>
          <Text style={{ color: colors.textSecondary }}>
            AutomonX-VLSI: Edge-Intelligent Home Safety System with Hardware-Optimized Sensor Data Compression and LoRa Communication
          </Text>
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={[styles.settingItem, globalStyles.cardShadow]}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.emailText}>{auth?.user?.email}</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutButton, globalStyles.cardShadow]}
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 15,
    marginBottom: 10,
  },
  settingItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  emailText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  urlInputContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  urlInput: {
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default SettingsScreen;
