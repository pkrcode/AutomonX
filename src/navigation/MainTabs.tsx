import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '@screens/main/DashboardScreen';
import EventLogScreen from '@screens/main/EventLogScreen';
import SettingsScreen from '@screens/main/SettingsScreen';
import { colors } from '../constants/colors';

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, color: focused ? colors.primary : colors.textSecondary }}>
    {label === 'Dashboard' ? '' : label === 'EventLog' ? '' : ''}
  </Text>
);

export type MainTabsParamList = {
  Dashboard: undefined;
  EventLog: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
      }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} /> }} />
      <Tab.Screen name="EventLog" component={EventLogScreen} options={{ tabBarLabel: 'Event Log', tabBarIcon: ({ focused }) => <TabIcon label="EventLog" focused={focused} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Settings" focused={focused} /> }} />
    </Tab.Navigator>
  );
};
