import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import OfflineVideoScreen from '../screens/OfflineVideoScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../utils/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName;
          if (route.name === 'Tasks') iconName = 'checkmark-done-circle';
          else if (route.name === 'Videos') iconName = 'videocam';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false,
      })}>
      <Tab.Screen name="Tasks" component={DashboardScreen} />
      <Tab.Screen name="Videos" component={OfflineVideoScreen} />
    </Tab.Navigator>
  );
}
