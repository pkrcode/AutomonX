import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing, ViewStyle, Vibration, View } from 'react-native';
import Svg, { Rect, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useThemeColors } from '../../constants/colors';

interface LightControlProps {
  label?: string;
  isOn: boolean;
  onToggle: (value: boolean) => void;
  style?: ViewStyle;
}

const LightControl: React.FC<LightControlProps> = ({ label = 'Room Lights', isOn, onToggle, style }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const glow = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Glow only when ON
    if (isOn) {
      glow.stopAnimation();
      glow.setValue(0);
      const seg = 700;
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: seg, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: seg, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      glow.stopAnimation();
      glow.setValue(0);
    }
  }, [isOn, glow]);

  // Derive scale and opacity; OFF = no aura
  const scaleRange = isOn ? 0.2 : 0;
  const glowScale = Animated.add(1, Animated.multiply(glow, scaleRange));
  const glowOpacity = isOn ? Animated.multiply(glow, 0.6) : new Animated.Value(0);

  const BulbIcon = ({ on, accent, stroke }: { on: boolean; accent: string; stroke: string }) => (
    <Svg width={72} height={72} viewBox="0 0 72 72">
      <Defs>
        <RadialGradient id="bulbGlow" cx="36" cy="28" r="18" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFF7B2" stopOpacity={on ? 1 : 0} />
          <Stop offset="100%" stopColor="#FFD84A" stopOpacity={on ? 0.7 : 0} />
        </RadialGradient>
      </Defs>
      {/* Bulb glass outline */}
      <Path d="M36 12 C 24 12, 18 22, 18 30 C 18 40, 26 44, 28 48 L 44 48 C 46 44, 54 40, 54 30 C 54 22, 48 12, 36 12 Z" fill={on ? 'url(#bulbGlow)' : 'none'} stroke={stroke} strokeWidth={2}/>
      {/* Filament */}
      <Path d="M28 30c2 0 4 4 8 4s6-4 8-4" stroke={on ? '#B8860B' : stroke} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* Neck */}
      <Rect x={30} y={48} width={12} height={6} rx={2} fill={accent} />
      {/* Base */}
      <Rect x={28} y={54} width={16} height={8} rx={2} fill={accent} />
      {/* Base grooves */}
      <Path d="M30 56h12 M30 59h12" stroke={stroke} strokeWidth={1.5} />
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
      <Animated.View style={[
        styles.iconCircle,
        { backgroundColor: isOn ? '#FFF4CC' : colors.primary + '15', transform: [{ scale: glowScale }, { scale: pressScale }] },
      ]}> 
        <Animated.View pointerEvents="none" style={[styles.glow, { opacity: glowOpacity }]} />
        <BulbIcon on={isOn} accent={colors.textSecondary} stroke={colors.textSecondary} />
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
    paddingVertical: 16,
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
    marginBottom: 10,
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFD84A', // warm light glow
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
    fontWeight: '600',
  },
});

export default LightControl;
