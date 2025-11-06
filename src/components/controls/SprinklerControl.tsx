import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing, ViewStyle, Vibration, View } from 'react-native';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { useThemeColors } from '../../constants/colors';

interface SprinklerControlProps {
  label?: string;
  isOn: boolean;
  onToggle: (value: boolean) => void;
  style?: ViewStyle;
}

const SprinklerControl: React.FC<SprinklerControlProps> = ({ label = 'Water Sprinkler', isOn, onToggle, style }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const pressScale = useRef(new Animated.Value(1)).current;

  // Three staggered spray animations
  const s1 = useRef(new Animated.Value(0)).current;
  const s2 = useRef(new Animated.Value(0)).current;
  const s3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (v: Animated.Value, delay: number) => {
      v.stopAnimation();
      v.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
    };

    let a1: Animated.CompositeAnimation | undefined;
    let a2: Animated.CompositeAnimation | undefined;
    let a3: Animated.CompositeAnimation | undefined;

    if (isOn) {
      a1 = makeLoop(s1, 0);
      a2 = makeLoop(s2, 200);
      a3 = makeLoop(s3, 400);
      a1.start(); a2.start(); a3.start();
    } else {
      [s1, s2, s3].forEach(v => { v.stopAnimation(); v.setValue(0); });
    }

    return () => { a1?.stop(); a2?.stop(); a3?.stop(); };
  }, [isOn, s1, s2, s3]);

  const handlePress = () => {
    Vibration.vibrate(10);
    Animated.sequence([
      Animated.timing(pressScale, { toValue: 0.98, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pressScale, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    onToggle(!isOn);
  };

  // Map each spray value to translateY and opacity; start under the head and fall downward
  const sprayProps = (v: Animated.Value) => ({
    opacity: Animated.multiply(v, 0.9),
    transform: [
      { translateY: Animated.multiply(v, 26) },
    ],
  });

  const SprinklerIcon = ({ accent, stroke, water }: { accent: string; stroke: string; water: string }) => (
    <Svg width={96} height={96} viewBox="0 0 96 96">
      <Defs>
        <LinearGradient id="headMetal" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#9EA7B3" />
          <Stop offset="100%" stopColor="#79808A" />
        </LinearGradient>
      </Defs>
      {/* Pipe */}
      <Rect x={46} y={10} width={4} height={18} rx={2} fill={stroke} />
      {/* Head */}
      <Rect x={36} y={26} width={24} height={10} rx={3} fill="url(#headMetal)" stroke={stroke} strokeWidth={1} />
      <Rect x={42} y={34} width={12} height={3} rx={1} fill={accent} />
      {/* Static ground/patch */}
      <Rect x={20} y={70} width={56} height={6} rx={3} fill={accent + '22'} />
      {/* Spray nozzles (left, center, right) */}
      <G>
        <Path d="M42 37 q-10 8 -18 10" stroke={water} strokeWidth={2} strokeLinecap="round" fill="none"/>
        <Path d="M48 37 q0 10 0 12" stroke={water} strokeWidth={2} strokeLinecap="round" fill="none"/>
        <Path d="M54 37 q10 8 18 10" stroke={water} strokeWidth={2} strokeLinecap="round" fill="none"/>
      </G>
    </Svg>
  );

  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.card, style]} onPress={handlePress}
      accessibilityRole="button" accessibilityLabel={`${label} ${isOn ? 'ON' : 'OFF'}`} accessibilityState={{ checked: isOn }}>
      <Animated.View style={[styles.iconCircle, { transform: [{ scale: pressScale }] }]}> 
        {/* Sprinkler head */}
        <SprinklerIcon accent={colors.primary} stroke={colors.textSecondary} water={isOn ? '#2CA9FF' : colors.textSecondary} />
        {/* Animated sprays (as overlay simple droplets) */}
        <Animated.View pointerEvents="none" style={[styles.spray, styles.sprayLeft, sprayProps(s1), { backgroundColor: '#2CA9FF' }]} />
        <Animated.View pointerEvents="none" style={[styles.spray, styles.sprayCenter, sprayProps(s2), { backgroundColor: '#2CA9FF' }]} />
        <Animated.View pointerEvents="none" style={[styles.spray, styles.sprayRight, sprayProps(s3), { backgroundColor: '#2CA9FF' }]} />
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
    overflow: 'hidden',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 8,
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
  // Simple rectangular sprays positioned under the head; animated by translateY/opacity
  spray: {
    position: 'absolute',
    top: 44,
    width: 6,
    height: 24,
    borderRadius: 3,
    opacity: 0,
  },
  sprayLeft: { left: 30 },
  sprayCenter: { left: 45 },
  sprayRight: { left: 60 },
});

export default SprinklerControl;
