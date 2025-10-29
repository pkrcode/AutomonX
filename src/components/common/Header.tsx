import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface HeaderProps {
  title: string;
  style?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({ title, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.card, // Use card color for the safe area background
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default Header;
