import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ScanScreen from '../screens/ScanScreen'; // Import the new scanner module
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 85,
          paddingBottom: 30, // Safe area for iOS
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 11,
          marginTop: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
          
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Search': iconName = 'search'; break;
            // Scan handled uniquely by tabBarButton below
            case 'History': iconName = 'time'; break;
            case 'Discover': iconName = 'sparkles'; break;
          }
           
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Search" component={PlaceholderScreen} initialParams={{ name: "Search" }} />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{ 
          tabBarLabel: '',
          // Use a custom button to break out of the clipping area
          tabBarButton: (props) => (
            <TouchableOpacity 
              onPress={props.onPress}
              accessibilityState={props.accessibilityState}
              activeOpacity={0.8}
              style={[props.style, { top: -20, justifyContent: 'center', alignItems: 'center' }]}
            >
              <View style={{
                width: 64, 
                height: 64, 
                borderRadius: 32, 
                backgroundColor: colors.primary,
                justifyContent: 'center', 
                alignItems: 'center',
                shadowColor: colors.primary, 
                shadowOffset: { width: 0, height: 6 }, 
                shadowOpacity: 0.35, 
                shadowRadius: 8, 
                elevation: 6
              }}>
                <Ionicons name="scan" size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )
        }}
      />
      <Tab.Screen name="History" component={PlaceholderScreen} initialParams={{ name: "History" }} />
      <Tab.Screen name="Discover" component={PlaceholderScreen} initialParams={{ name: "Discover" }} />
    </Tab.Navigator>
  );
}
