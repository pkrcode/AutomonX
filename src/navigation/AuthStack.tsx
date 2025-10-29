import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import auth screens using path aliases
import LoginScreen from '@screens/auth/LoginScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';

// Define the types for the stack parameters
export type AuthStackParamList = {
  Login: undefined; // No parameters expected for Login screen
  SignUp: undefined; // No parameters expected for SignUp screen
};

// Create the stack navigator
const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Navigation stack for authentication screens (Login, Sign Up).
 * This stack is shown when the user is not logged in.
 */
export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide the default header
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};
