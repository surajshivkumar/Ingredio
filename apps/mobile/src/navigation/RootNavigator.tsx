import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import BottomTabNavigator from './BottomTabNavigator';

// Define our types for strict typing later on
export type RootStackParamList = {
  SplashLogin: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 
        The initial screen is our bouncy mascot + login UI 
      */}
      <Stack.Screen name="SplashLogin" component={HomeScreen} />
      
      {/* 
        Once they click Login/Signup, we replace the stack with the BottomTabs 
        preventing them from swiping back to the login screen 
      */}
      <Stack.Screen 
        name="MainTabs" 
        component={BottomTabNavigator} 
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
