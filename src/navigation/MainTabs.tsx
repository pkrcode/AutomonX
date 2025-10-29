import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, View } from 'react-native';

// Import main screens using path aliases
import DashboardScreen from '@screens/main/DashboardScreen';
import EventLogScreen from '@screens/main/EventLogScreen';
import SettingsScreen from '@screens/main/SettingsScreen';

// Import constants
import { colors } from '../../constants/colors';

// Import icons (example paths, replace with your actual icon assets)
const ICON_PATHS = {
  dashboard: require('../../assets/icons/dashboard_icon.png'),
  eventLog: require('../../assets/icons/log_icon.png'),
  settings: require('../../assets/icons/settings_icon.png'),
};

// Define the types for the tab parameters
export type MainTabsParamList = {
  Dashboard: undefined;
  EventLog: undefined;
  Settings: undefined;
};

// Create the tab navigator
const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * Renders an icon for the tab bar.
 */
const TabBarIcon = ({
  iconPath,
  focused,
}: {
  iconPath: any;
  focused: boolean;
}) => (
  <View style={styles.iconContainer}>
    <Image
      source={iconPath}
      resizeMode="contain"
      style={[
        styles.icon,
        { tintColor: focused ? colors.primary : colors.textSecondary },
      ]}
    />
  </View>
);

/**
 * Main bottom tab navigator for the app.
 * This is shown when the user is logged in.
 */
export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // We will use custom headers in each screen
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconPath={ICON_PATHS.dashboard} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EventLog"
        component={EventLogScreen}
        options={{
          title: 'Event Log',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconPath={ICON_PATHS.eventLog} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon iconPath={ICON_PATHS.settings} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5, // Adjust this padding as needed
  },
  icon: {
    width: 24,
    height: 24,
  },
});
