import React, { useContext } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';

// Import components and constants using path aliases
import Header from '@components/common/Header';
import { colors } from '@constants/colors';
import { globalStyles } from '@constants/styles';

// Import contexts
import { AuthContext } from '@context/AuthContext';
import { SettingsContext } from '@context/SettingsContext';
import { AuthService } from '@services/AuthService';

const SettingsScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const settings = useContext(SettingsContext);

  if (!settings) {
    // This should not happen if App.tsx is set up correctly
    return null;
  }

  const { isDarkMode, toggleDarkMode } = settings;

  const handleLogout = () => {
    AuthService.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* App Settings */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={[styles.settingItem, globalStyles.shadow]}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor={isDarkMode ? colors.primaryDark : colors.background}
            onValueChange={toggleDarkMode}
            value={isDarkMode}
          />
        </View>
        <View style={[styles.settingItem, globalStyles.shadow]}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          {/* This toggle would be wired up to SettingsContext */}
          <Switch
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor={colors.background}
            // onValueChange={...}
            value={true} // Placeholder
          />
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={[styles.settingItem, globalStyles.shadow]}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.emailText}>{auth.user?.email}</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutButton, globalStyles.shadow]}
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default SettingsScreen;
