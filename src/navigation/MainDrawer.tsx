import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import DashboardScreen from '@screens/main/DashboardScreen';
import ControlsAnimationDemo from '@screens/main/ControlsAnimationDemo';
import SettingsScreen from '@screens/main/SettingsScreen';
import { useThemeColors } from '../constants/colors';
import { useAuth } from '@context/AuthContext';

export type MainDrawerParamList = {
  Dashboard: undefined;
  Settings: undefined;
  ControlsDemo: undefined;
};

const Stack = createStackNavigator<MainDrawerParamList>();

// Temporary replacement for Drawer with a simple stack to avoid Reanimated legacy error.
export const MainDrawer = () => {
  useAuth();
  const colors = useThemeColors();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: { animation: 'timing', config: { duration: 230 } },
          close: { animation: 'timing', config: { duration: 230 } },
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ControlsDemo" component={ControlsAnimationDemo} />
    </Stack.Navigator>
  );
};
// Styles for Drawer were removed with the switch to a simple stack.
