import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
}

export default function SearchBar({ placeholder = 'Search categories...', onChangeText }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={`flex-row items-center gap-3 bg-white rounded-2xl px-4 py-3 ${focused ? 'border-2 border-primary' : 'border border-[#EEEEEE]'}`}>
      <Ionicons name="search-outline" size={20} color={focused ? '#4CAF50' : '#6C757D'} />
      <TextInput
        className="flex-1 text-[15px] text-textBase font-medium"
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
    </View>
  );
}