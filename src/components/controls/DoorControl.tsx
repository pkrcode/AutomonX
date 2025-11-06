import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing, ViewStyle, Vibration, View } from 'react-native';
import Svg, { Rect, Path, Circle as SvgCircle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useThemeColors } from '../../constants/colors';

interface DoorControlProps {
  label?: string;
  isLocked: boolean;
  onToggle: (value: boolean) => void;
  style?: ViewStyle;
}

const DoorControl: React.FC<DoorControlProps> = ({ label = 'Door Lock', isLocked, onToggle, style }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const pressScale = useRef(new Animated.Value(1)).current;

  // door swing animation: 0 = closed, 1 = open
  const swing = useRef(new Animated.Value(isLocked ? 0 : 1)).current;
  const swingDeg = swing.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-18deg'] });

  // keyhole glow pulse on unlock
  const keyGlow = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Vibration.vibrate(10);
    Animated.sequence([
      Animated.timing(pressScale, { toValue: 0.98, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pressScale, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    onToggle(!isLocked);
  };

  // animate swing when lock state changes
  useEffect(() => {
    if (!isLocked) {
      // Unlock: open with a gentle overshoot then settle
      Animated.sequence([
        Animated.timing(swing, { toValue: 1.1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0.95, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(swing, { toValue: 1.0, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();

      // Keyhole glow: quick pulse x2
      keyGlow.stopAnimation();
      keyGlow.setValue(0);
      const pulse = Animated.sequence([
        Animated.timing(keyGlow, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(keyGlow, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]);
      Animated.sequence([pulse, pulse]).start();
    } else {
      // Locked: no animation, snap closed and clear glow
      swing.stopAnimation();
      swing.setValue(0);
      keyGlow.stopAnimation();
      keyGlow.setValue(0);
    }
  }, [isLocked, swing]);

  const DoorLockIcon = ({ stroke, accent, swingDeg, keyGlow }: { stroke: string; accent: string; swingDeg: string; keyGlow: Animated.Value }) => (
    <>
      {/* Static frame */}
      <Svg width={96} height={96} viewBox="0 0 96 96">
        <Defs>
          <LinearGradient id="doorPanel" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#D9A066" />
            <Stop offset="100%" stopColor="#B67E44" />
          </LinearGradient>
          <LinearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#7A4F2B" />
            <Stop offset="100%" stopColor="#5C3A20" />
          </LinearGradient>
        </Defs>
        <Rect x={18} y={18} width={60} height={60} rx={6} fill="url(#frame)" stroke={stroke} strokeWidth={1.5} />
      </Svg>
      {/* Swinging door leaf overlay */}
      <Animated.View
        style={{ position: 'absolute', left: 0, top: 0, width: 96, height: 96, alignItems: 'flex-start', justifyContent: 'center', transform: [{ translateX: 24 }, { rotate: swingDeg }, { translateX: -24 }] }}
        pointerEvents="none"
      >
        <Svg width={96} height={96} viewBox="0 0 96 96">
          <Rect x={22} y={22} width={52} height={52} rx={4} fill="url(#doorPanel)" stroke={stroke} strokeWidth={1} />
          <Rect x={28} y={28} width={40} height={18} rx={2} fill="#C58A4F" stroke={stroke} strokeWidth={0.5} />
          <Rect x={28} y={50} width={40} height={18} rx={2} fill="#C58A4F" stroke={stroke} strokeWidth={0.5} />
          {/* Handle/lock */}
          <SvgCircle cx={66} cy={48} r={3} fill={accent} />
          <Path d="M66 51 v5" stroke={accent} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        {/* Keyhole glow pulse */}
        <Animated.View
          style={{ position: 'absolute', left: 66 - 10, top: 48 - 10, width: 20, height: 20, borderRadius: 10, backgroundColor: accent, opacity: keyGlow,
            transform: [{ scale: keyGlow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.4] }) }], shadowColor: accent, shadowOpacity: 0.8, shadowRadius: 6, elevation: 3 }}
          pointerEvents="none"
        />
      </Animated.View>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.card, style]} onPress={handlePress} accessibilityRole="button" accessibilityLabel={`${label} ${isLocked ? 'LOCKED' : 'UNLOCKED'}`} accessibilityState={{ expanded: !isLocked }}>
      <Animated.View style={[styles.iconCircle, { transform: [{ scale: pressScale }] }]}> 
        <DoorLockIcon stroke={colors.textSecondary} accent={colors.primary} swingDeg={swingDeg as any} keyGlow={keyGlow} />
      </Animated.View>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.status, { color: isLocked ? colors.textSecondary : colors.success }]}>{isLocked ? 'LOCKED' : 'UNLOCKED'}</Text>
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
    backfaceVisibility: 'hidden',
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

export default DoorControl;
