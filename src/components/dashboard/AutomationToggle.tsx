import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { colors } from '../../constants/colors';

interface AutomationToggleProps {
  label: string;
  isEnabled: boolean;
  onToggle: (newValue: boolean) => void;
  disabled?: boolean;
}

const AutomationToggle: React.FC<AutomationToggleProps> = ({
  label,
  isEnabled,
  onToggle,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.disabledText]}>
        {label}
      </Text>
      <Switch
        trackColor={{ false: colors.textSecondary, true: colors.primary }}
        thumbColor={isEnabled ? colors.card : colors.card}
        ios_backgroundColor={colors.textSecondary}
        onValueChange={onToggle}
        value={isEnabled}
        disabled={disabled}
        style={styles.switch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  switch: {
    // Tweak scale for a slightly larger switch if needed, especially on Android
    transform: Platform.OS === 'android' ? [{ scaleX: 1.1 }, { scaleY: 1.1 }] : [],
  },
});

export default AutomationToggle;
