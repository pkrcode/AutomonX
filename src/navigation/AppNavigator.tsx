import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext'; // Using path alias
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import LoadingIndicator from '@components/common/LoadingIndicator'; // Using path alias
import { colors } from '@constants/colors'; // Using path alias
import { View, StyleSheet } from 'react-native';

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Show a loading screen while auth state is being checked
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* If user is logged in, show main app. Otherwise, show login screen. */}
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
