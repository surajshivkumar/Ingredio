import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ScanCard } from '../components';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      
      {/* Top Header / User Badge */}
      <View className="flex-row justify-between items-center px-6 py-5 bg-white border-b border-[#EEEEEE]">
        <View className="flex-row items-center gap-3">
          <Image 
            source={require('../../assets/mascot.webp')} 
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E9' }}
            resizeMode="cover"
          />
          <View>
            <Text className="text-[13px] text-textMuted font-medium">Welcome back,</Text>
            <Text className="text-lg font-black text-textBase">Suraaj</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2 bg-[#F0F0F0] rounded-full">
          <Text className="text-xl">🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Mascot Banner */}
        <View className="bg-[#E8F5E9] rounded-3xl p-6 flex-row items-center justify-between mb-8">
          <View className="flex-1">
            <Text className="text-[22px] font-black text-primary mb-1.5">Scan Groceries & Cosmetics!</Text>
            <Text className="text-sm text-[#4A7A4C] font-medium opacity-80">Instantly check ingredient safety.</Text>
          </View>
          <Image 
            source={require('../../assets/mascot_happy.webp')} 
            style={{ width: 80, height: 80, transform: [{ translateY: -10 }] }}
            resizeMode="contain" 
          />
        </View>


        {/* Recent Scans */}
        <Text className="text-xl font-black text-textBase mb-4">Recent Scans</Text>
        
        <View className="gap-3">
          <ScanCard title="Oat & Honey Moisturizer" details="100% Safe Ingredients • Cosmetic" score="A" color="bg-primary" />
          <ScanCard title="Organic Tomato Sauce" details="Contains High Sodium • Grocery" score="C" color="bg-secondary" />
          <ScanCard title="Clear Repair Sunscreen" details="Contains Oxybenzone • Cosmetic" score="F" color="bg-danger" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
