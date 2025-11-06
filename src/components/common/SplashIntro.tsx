import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image, Dimensions } from 'react-native';
import Svg, { Rect, Path, Circle as SvgCircle } from 'react-native-svg';

const INDIGO = '#3F51B5';
const BLUE = '#1E88E5';

const { width: SCREEN_W } = Dimensions.get('window');

const SplashIntro: React.FC = () => {
  // Anim values
  const shackle = useRef(new Animated.Value(0)).current; // 0=open, 1=closed
  const thread1 = useRef(new Animated.Value(0)).current;
  const thread2 = useRef(new Animated.Value(0)).current;
  const thread3 = useRef(new Animated.Value(0)).current;
  const topW = useRef(new Animated.Value(0)).current;
  const rightH = useRef(new Animated.Value(0)).current;
  const bottomW = useRef(new Animated.Value(0)).current;
  const leftH = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(8)).current;
  const titleOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Timeline
    // 1) Start unlocked (shackle open), then close
    shackle.setValue(0);
    Animated.sequence([
      Animated.delay(100),
      Animated.timing(shackle, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // 2) Threads appear one by one
    thread1.setValue(0); thread2.setValue(0); thread3.setValue(0);
    Animated.stagger(90, [
      Animated.timing(thread1, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(thread2, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(thread3, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // 3) Home border draws around: top -> right -> bottom -> left
    topW.setValue(0); rightH.setValue(0); bottomW.setValue(0); leftH.setValue(0);
    Animated.sequence([
      Animated.timing(topW, { toValue: 1, duration: 220, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(rightH, { toValue: 1, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(bottomW, { toValue: 1, duration: 180, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(leftH, { toValue: 1, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]).start();

    // 4) Title fade/slide in
    titleOp.setValue(0); titleY.setValue(8);
    Animated.parallel([
      Animated.timing(titleOp, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [shackle, thread1, thread2, thread3, topW, rightH, bottomW, leftH, titleOp, titleY]);

  // Interpolations
  const shackleDeg = shackle.interpolate({ inputRange: [0, 1], outputRange: ['-28deg', '0deg'] });

  // Border sizes (box)
  const BOX = 96;
  const borderTopW = topW.interpolate({ inputRange: [0, 1], outputRange: [0, BOX] });
  const borderRightH = rightH.interpolate({ inputRange: [0, 1], outputRange: [0, BOX] });
  const borderBottomW = bottomW.interpolate({ inputRange: [0, 1], outputRange: [0, BOX] });
  const borderLeftH = leftH.interpolate({ inputRange: [0, 1], outputRange: [0, BOX] });

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        {/* PNG logo centered behind */}
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />

        {/* Blue lock over logo */}
        <View style={styles.lockWrap}>
          <Svg width={72} height={72} viewBox="0 0 72 72">
            {/* Body */}
            <Rect x={20} y={32} width={32} height={24} rx={6} fill={BLUE} />
            {/* Keyhole */}
            <SvgCircle cx={36} cy={44} r={3} fill="#fff" />
            <Path d="M36 47 v5" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          {/* Shackle animated */}
          <Animated.View style={{ position: 'absolute', top: 10, left: 12, transform: [{ translateX: 12 }, { rotate: shackleDeg }, { translateX: -12 }] }}>
            <Svg width={72} height={72} viewBox="0 0 72 72">
              <Path d="M24 32 C24 18, 48 18, 48 32" stroke={BLUE} strokeWidth={6} fill="none" strokeLinecap="round" />
            </Svg>
          </Animated.View>
        </View>

        {/* Threads below lock */}
        <View style={styles.threads}>
          <Animated.View style={[styles.thread, { opacity: thread1 }]} />
          <Animated.View style={[styles.thread, { opacity: thread2, width: 28 }]} />
          <Animated.View style={[styles.thread, { opacity: thread3, width: 34 }]} />
        </View>

        {/* Home border drawing */}
        <View style={styles.borderBox}>
          <Animated.View style={[styles.borderTop, { width: borderTopW }]} />
          <Animated.View style={[styles.borderRight, { height: borderRightH }]} />
          <Animated.View style={[styles.borderBottom, { width: borderBottomW }]} />
          <Animated.View style={[styles.borderLeft, { height: borderLeftH }]} />
        </View>

        {/* App name */}
        <Animated.Text style={[styles.title, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>AutoMonX</Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: SCREEN_W * 0.36,
    height: SCREEN_W * 0.36,
    opacity: 0.9,
  },
  lockWrap: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threads: {
    marginTop: 6,
    height: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thread: {
    height: 2,
    width: 22,
    backgroundColor: BLUE,
    borderRadius: 1,
    marginVertical: 2,
  },
  borderBox: {
    width: 96,
    height: 96,
    marginTop: 10,
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: BLUE,
  },
  borderRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 2,
    backgroundColor: BLUE,
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: 2,
    backgroundColor: BLUE,
  },
  borderLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 2,
    backgroundColor: BLUE,
  },
  title: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
    color: INDIGO,
    letterSpacing: 0.5,
  },
});

export default SplashIntro;
