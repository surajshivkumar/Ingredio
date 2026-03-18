import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

interface CategoryCardProps {
  title: string;
  icon: ImageSourcePropType;
}

export default function CategoryCard({ title, icon }: CategoryCardProps) {
  return (
    <View className="bg-gray-100 rounded-2xl p-3 w-[100px] items-center justify-center gap-2">
      <Image 
        source={icon} 
        style={{ width: 40, height: 40 }} 
        resizeMode="contain" 
      />
      <Text className="text-[11px] font-semibold text-textBase text-center leading-tight">{title}</Text>
    </View>
  );
}
