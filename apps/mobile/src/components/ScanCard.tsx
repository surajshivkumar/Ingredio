import React from 'react';
import { View, Text } from 'react-native';

interface ScanCardProps {
  title: string;
  details: string;
  score: string;
  color: string;
}

export function ScanCard({ title, details, score, color }: ScanCardProps) {
  return (
    <View className="flex-row items-center bg-white p-4 rounded-[20px] gap-4 shadow-black shadow-offset-[0,2] shadow-opacity-5 shadow-radius-8 elevation-2">
      <View className={`w-12 h-12 rounded-full items-center justify-center ${color}`}>
        <Text className="text-white text-[22px] font-black">{score}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-textBase mb-1">{title}</Text>
        <Text className="text-[13px] text-textMuted font-medium">{details}</Text>
      </View>
    </View>
  );
}
