import React, { useContext } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
} from 'react-native';

// Import components and constants using path aliases
import Header from '@components/common/Header';
import SensorCard from '@components/dashboard/SensorCard';
import SecurityStatus from '@components/dashboard/SecurityStatus';
import AutomationToggle from '@components/dashboard/AutomationToggle';
import LoadingIndicator from '@components/common/LoadingIndicator';
import { colors } from '@constants/colors';
import { globalStyles } from '@constants/styles';

// Import hooks and context using path aliases
import { useSensorData } from '@hooks/useSensorData';
import { AuthContext } from '@context/AuthContext';

// Import services using path aliases
import { DeviceControlService } from '@services/DeviceControlService';

const DashboardScreen: React.FC = () => {
  const auth = useContext(AuthContext);

  // In a real app, you might get the deviceId from user settings
  // or a list of devices. For now, we'll assume the main
  // device document ID in Firestore is the same as the user's ID.
  const deviceId = auth.user?.uid;

  // Use our custom hook to get real-time sensor data
  const { data, loading, error } = useSensorData(deviceId || 'default-device');

  // Handle automation toggles
  const handleToggle = (automationId: string, value: boolean) => {
    if (!deviceId) return;
    console.log(`Toggling ${automationId} to ${value}`);
    // Example: Update the 'automations' subcollection
    DeviceControlService.updateAutomation(deviceId, automationId, value);
  };

  if (loading && !data) {
    return <LoadingIndicator message="Fetching device data..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Error" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Error fetching sensor data. Please check your connection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Extract specific sensor data from the 'data' object
  // These names (e.g., 'irSensor', 'dht22', 'mq135') MUST
  // match the field names in your Firestore document.
  const securityStatus = data?.irSensor?.breach || false;
  const temperature = data?.dht22?.temperature || 0;
  const humidity = data?.dht22?.humidity || 0;
  const airQuality = data?.mq135?.airQualityPPM || 0;
  const gasDetected = data?.mq2?.gasDetected || false;

  // Extract automation states
  const fanOn = data?.automations?.fan || false;
  const lightsOn = data?.automations?.lights || false;
  const doorLocked = data?.automations?.doorLock || true;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="AutoMonX Dashboard" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <SecurityStatus breachDetected={securityStatus} />

        {/* Sensors Section */}
        <Text style={styles.sectionTitle}>Live Sensors</Text>
        <View style={styles.cardRow}>
          <SensorCard
            title="Temperature"
            value={`${temperature.toFixed(1)}°C`}
            status={temperature > 40 ? 'High' : 'Normal'}
            iconName="thermometer" // Example: replace with your icon
          />
          <SensorCard
            title="Humidity"
            value={`${humidity.toFixed(1)}%`}
            status={humidity > 70 ? 'High' : 'Normal'}
            iconName="droplet" // Example: replace with your icon
          />
        </View>
        <View style={styles.cardRow}>
          <SensorCard
            title="Air Quality"
            value={`${airQuality} PPM`}
            status={airQuality > 300 ? 'Poor' : 'Good'}
            iconName="wind" // Example: replace with your icon
          />
          <SensorCard
            title="Gas"
            value={gasDetected ? 'Detected' : 'Clear'}
            status={gasDetected ? 'Alert' : 'Normal'}
            iconName="alert-triangle" // Example: replace with your icon
          />
        </View>

        {/* Automation Section */}
        <Text style={styles.sectionTitle}>Controls</Text>
        <AutomationToggle
          label="Exhaust Fan"
          isEnabled={fanOn}
          onToggle={value => handleToggle('fan', value)}
        />
        <AutomationToggle
          label="Room Lights"
          isEnabled={lightsOn}
          onToggle={value => handleToggle('lights', value)}
        />
        <AutomationToggle
          label="Door Lock"
          isEnabled={doorLocked}
          onToggle={value => handleToggle('doorLock', value)}
        />
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
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 15,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
