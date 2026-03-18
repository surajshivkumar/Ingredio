import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { CategoryItem } from '../types/api';

interface ProductCardProps {
  item: CategoryItem;
  onPress?: () => void;
}

export function ProductCard({ item, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 20,
        gap: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Product image or placeholder */}
      {item.image_front_url ? (
        <Image
          source={{ uri: item.image_front_url }}
          style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#F0F0F0' }}
          resizeMode="contain"
        />
      ) : (
        <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24 }}>📦</Text>
        </View>
      )}

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#212529' }} numberOfLines={2}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: '#6C757D', marginTop: 2 }} numberOfLines={1}>{item.brand_name}</Text>
        {item.calories_per_100g != null && (
          <Text style={{ fontSize: 11, color: '#6C757D', marginTop: 2 }}>{item.calories_per_100g} kcal / 100g</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

