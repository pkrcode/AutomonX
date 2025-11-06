import firestore from '@react-native-firebase/firestore';

/**
 * Service for controlling device automations and settings
 */

/**
 * Update a specific automation setting for a device
 * @param deviceId The device document ID in Firestore
 * @param automationId The automation field to update (e.g., 'fan', 'lights', 'doorLock')
 * @param value The new value (true/false)
 */
const updateAutomation = async (
  deviceId: string,
  automationId: string,
  value: boolean,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await firestore()
      .collection('devices')
      .doc(deviceId)
      .update({
        [`automations.${automationId}`]: value,
      });
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message || 'Failed to update automation.' };
  }
};

/**
 * Update device settings or sensor thresholds
 * @param deviceId The device document ID
 * @param settings Object containing settings to update
 */
const updateDeviceSettings = async (
  deviceId: string,
  settings: Record<string, any>,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await firestore()
      .collection('devices')
      .doc(deviceId)
      .update(settings);
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message || 'Failed to update settings.' };
  }
};

// Export as default object
const DeviceControlService = {
  updateAutomation,
  updateDeviceSettings,
};

export default DeviceControlService;
