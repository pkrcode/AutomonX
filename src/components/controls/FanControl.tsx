import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing, ViewStyle, Vibration, View } from 'react-native';
import Svg, { G, Circle as SvgCircle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useThemeColors } from '../../constants/colors';

interface FanControlProps {
  label?: string;
  isOn: boolean;
  onToggle: (value: boolean) => void;
  style?: ViewStyle;
}

const FanControl: React.FC<FanControlProps> = ({ label = 'Exhaust Fan', isOn, onToggle, style }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const rotation = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isOn) {
      rotation.stopAnimation();
      rotation.setValue(0);
      anim = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.start();
    } else {
      rotation.stopAnimation();
    }
    return () => { anim?.stop(); };
  }, [isOn, rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ExhaustFanIcon = ({ color, accent }: { color: string; accent: string }) => (
    <Svg width={72} height={72} viewBox="0 0 72 72">
      <Defs>
        <LinearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      {/* Guard ring */}
      <SvgCircle cx={36} cy={36} r={28} stroke={accent} strokeWidth={2} fill="none" />
      {/* 12 slender blades at 30° increments */}
      {Array.from({ length: 12 }).map((_, i) => (
        <G key={i} transform={`rotate(${i * 30} 36 36)`}>
          {/* Rounded slender blade extending outwards */}
          <Path d="M46 33 h14 a3 3 0 0 1 0 6 h-14 a3 3 0 0 1 0 -6 z" fill="url(#bladeGrad)" />
        </G>
      ))}
      {/* Hub */}
      <SvgCircle cx={36} cy={36} r={5} fill={accent} />
    </Svg>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, style]}
      onPress={() => { Vibration.vibrate(10); onToggle(!isOn); }}
      onPressIn={() => {
        Animated.timing(pressScale, { toValue: 0.98, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      }}
      onPressOut={() => {
        Animated.timing(pressScale, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${isOn ? 'ON' : 'OFF'}`}
      accessibilityState={{ checked: isOn }}
    >
      <Animated.View style={[styles.iconCircle, { transform: [{ rotate: rotateInterpolate }, { scale: pressScale }] }]}> 
        <ExhaustFanIcon color={isOn ? colors.primary : colors.textSecondary} accent={colors.textSecondary} />
      </Animated.View>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.status, { color: isOn ? colors.success : colors.textSecondary }]}>{isOn ? 'ON' : 'OFF'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    marginVertical: 8,
    marginHorizontal: 6,
    backgroundColor: colors.card,
    borderRadius: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  emoji: {
    fontSize: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  status: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default FanControl;
