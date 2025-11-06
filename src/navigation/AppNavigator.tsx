import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext'; // Using path alias
import { AuthStack } from './AuthStack';
import { MainDrawer } from './MainDrawer';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../constants/colors';
import SplashIntro from '@components/common/SplashIntro';
import ErrorBoundary from '@components/common/ErrorBoundary';

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const colors = useThemeColors();

  // Create a navigation theme that matches our app theme to avoid white flashes
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.danger,
    },
  } as const;

  // Show a loading screen while auth state is being checked
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ErrorBoundary>
          <SplashIntro />
        </ErrorBoundary>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {/* If user is logged in, show main app. Otherwise, show login screen. */}
      {user ? <MainDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
