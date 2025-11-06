import React, { useContext, useMemo, useRef } from 'react';
import { Text, Switch, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { useThemeColors } from '../../constants/colors';
import { SettingsContext } from '../../context/SettingsContext_Simple';

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
  const colors = useThemeColors();
  const settings = useContext(SettingsContext);
  const isDarkMode = settings?.settings.theme === 'dark';
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const styles = createStyles(colors);

  const onValueChange = (v: boolean) => {
    // Pulse animation: quick scale and soft highlight
    Animated.parallel([
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 0.97,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 0.25,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onToggle(v);
  };

  const highlightColor = useMemo(() => ({
    backgroundColor: isDarkMode ? colors.primary : colors.primary,
  }), [isDarkMode, colors.primary]);
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseScale }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.highlight, highlightColor, { opacity: pulseOpacity }]}
      />
      <Text
        style={[styles.label, disabled && styles.disabledText]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
      <Switch
        trackColor={{ false: colors.textSecondary, true: colors.primary }}
        thumbColor={isDarkMode ? colors.gray : colors.lightGray}
        ios_backgroundColor={colors.textSecondary}
        onValueChange={onValueChange}
        value={isEnabled}
        disabled={disabled}
        style={styles.switch}
      />
    </Animated.View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    flex: 1,
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

// Deprecated: Replaced by animated control cards (FanControl, LightControl, DoorControl)
export {};
export default AutomationToggle;
