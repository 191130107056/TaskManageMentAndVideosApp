import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import OfflineVideoScreen from '../screens/OfflineVideoScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../utils/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TaskStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tasks"
        component={DashboardScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TaskDetailsScreen"
        component={TaskDetailsScreen}
        options={{
          title: 'Task Details',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'TaskStack') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Videos') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
      })}>
      <Tab.Screen
        name="TaskStack"
        component={TaskStack}
        options={{
          title: 'Tasks',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Videos"
        component={OfflineVideoScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
        }}
      />
    </Tab.Navigator>
  );
}
