import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SearchBar } from '../components';
import { getCategories } from '../services/products.service';
import { Category } from '../types/api';

// Map DB category names → local icon assets
const iconMap: Record<string, any> = {
  'Snacks':              require('../../assets/category-icons/snack.png'),
  'Biscuits':            require('../../assets/category-icons/cookie.png'),
  'Beverages':           require('../../assets/category-icons/drink.png'),
  'Dairy':               require('../../assets/category-icons/dairy-products.png'),
  'Chocolate':           require('../../assets/category-icons/chocolate.png'),
  'Confectionery':       require('../../assets/category-icons/sweets.png'),
  'Breads':              require('../../assets/category-icons/breads.png'),
  'Breakfasts':          require('../../assets/category-icons/breakfast.png'),
  'Meals':               require('../../assets/category-icons/meals.png'),
  'Noodles':             require('../../assets/category-icons/noodles.png'),
  'Nuts & Dried Fruits': require('../../assets/category-icons/nuts.png'),
  'Vegetables & Fruits': require('../../assets/category-icons/vegetable.png'),
  'Pulses & Grains':     require('../../assets/category-icons/pulses.png'),
  'Oils & Fats':         require('../../assets/category-icons/olive-oil.png'),
  'Condiments':          require('../../assets/category-icons/spices.png'),
  'Teas':                require('../../assets/category-icons/tea.png'),
  'Desserts':            require('../../assets/category-icons/sweets.png'),
  'Plant-based Foods':   require('../../assets/category-icons/vegan.png'),
  'Baby Foods':          require('../../assets/category-icons/infant.png'),
  'Personal Care':       require('../../assets/category-icons/personal.png'),
  'Beauty':              require('../../assets/category-icons/Beauty.png'),
  'Dietary Supplements': require('../../assets/category-icons/pills.png'),
  'Non-food Products':   require('../../assets/category-icons/basket.png'),
  'Uncategorized':       require('../../assets/category-icons/food.png'),
};

interface Props {
  navigation: any;
}

export default function ExploreScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then((data) => {
        console.log('[ExploreScreen] categories fetched:', data.length, data[0]);
        setCategories(data);
      })
      .catch((e) => {
        console.error('[ExploreScreen] fetch error:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-textMuted text-sm mt-3">Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text className="text-textBase font-bold mt-3 text-center">Could not connect to API</Text>
          <Text className="text-textMuted text-sm mt-2 text-center">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text className="text-2xl font-black text-textBase mb-1">Explore</Text>
            <Text className="text-sm text-textMuted font-medium mb-4">Browse by category</Text>
            <SearchBar placeholder="Search categories..." onChangeText={setQuery} />
            <View style={{ height: 20 }} />
          </View>
        }
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const icon = iconMap[item.name];
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CategoryItems', {
                categoryId: item.id,
                categoryName: item.name,
              })}
            >
              {icon ? (
                <Image source={icon} style={{ width: 40, height: 40 }} resizeMode="contain" />
              ) : (
                <Text style={{ fontSize: 28 }}>📦</Text>
              )}
              <Text style={styles.cardLabel} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  list: { padding: 24, paddingBottom: 100 },
  row: { justifyContent: 'center', gap: 12, marginBottom: 12 },
  card: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    lineHeight: 14,
  },
});
