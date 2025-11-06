import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
import { useThemeColors } from '../../constants/colors';

type RightIconType = 'menu' | 'settings' | 'close' | 'back';
type LeftIconType = 'home' | 'settings' | 'none';

interface HeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  leftIcon?: LeftIconType;
  onLogoPress?: () => void;
  rightIcon?: RightIconType;
  onRightPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, style, leftIcon = 'home', onLogoPress, rightIcon, onRightPress }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, style]}>
      {/* Logo/Icon Area */}
      {leftIcon !== 'none' && onLogoPress ? (
        <TouchableOpacity
          style={[
            styles.logoContainer,
            leftIcon === 'settings' ? null : styles.logoHomeBackground,
          ]}
          onPress={onLogoPress}
          activeOpacity={0.7}
        >
          {leftIcon === 'settings' ? (
            <Text style={styles.logoEmoji}>⚙️</Text>
          ) : (
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      ) : leftIcon !== 'none' ? (
        <View
          style={[
            styles.logoContainer,
            leftIcon === 'settings' ? null : styles.logoHomeBackground,
          ]}
        >
          {leftIcon === 'settings' ? (
            <Text style={styles.logoEmoji}>⚙️</Text>
          ) : (
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          )}
        </View>
      ) : <View style={{ width: 50, height: 50, marginRight: 12 }} />}
      
      {/* Title */}
      <View style={styles.textContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>

      {/* Right Action Icon */}
      {rightIcon && onRightPress ? (
        <TouchableOpacity style={styles.menuButton} onPress={onRightPress} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>
            {rightIcon === 'menu' ? '☰' : rightIcon === 'settings' ? '⚙️' : rightIcon === 'close' ? '✕' : '←'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginTop: STATUSBAR_HEIGHT + 20,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // Default background: legacy light-tinted primary (works well for settings gear)
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  // Home logo gets a consistently light background in both themes
  logoHomeBackground: {
    backgroundColor: '#D9EBFF', // approximate of primary 15% over white
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  logo: {
    fontSize: 28,
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoImage: {
    width: 40,
    height: 40,
    // Nudge upward slightly to counteract visual bottom-weight in the asset
    marginTop: -4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  menuIcon: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default Header;
