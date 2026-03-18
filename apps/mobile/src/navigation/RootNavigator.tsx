import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import BottomTabNavigator from './BottomTabNavigator';
import CategoryItemsScreen from '../screens/CategoryItemsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

export type RootStackParamList = {
  SplashLogin: undefined;
  MainTabs: undefined;
  CategoryItems: { categoryId: string; categoryName: string };
  ProductDetail: { categoryId: string; itemId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashLogin" component={HomeScreen} />
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="CategoryItems" component={CategoryItemsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

