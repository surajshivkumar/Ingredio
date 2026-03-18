import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components';
import { ProductCard } from '../components/ProductCard';
import { getItemsByCategory } from '../services/products.service';
import { CategoryItem } from '../types/api';

interface Props {
  route: { params: { categoryId: string; categoryName: string } };
  navigation: any;
}

export default function CategoryItemsScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItemsByCategory(categoryId)
      .then((data) => {
        console.log('[CategoryItems] fetched:', data.length, 'items', data[0]);
        setItems(data);
      })
      .catch((e) => {
        console.error('[CategoryItems] error:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  const filtered = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.brand_name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#212529', flex: 1 }} numberOfLines={1}>{categoryName}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchBar placeholder={`Search ${categoryName}...`} onChangeText={setQuery} />
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#6C757D', marginTop: 12 }}>Loading products...</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>😕</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Something went wrong</Text>
          <Text style={{ color: '#6C757D', marginTop: 4, textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>No products found</Text>
          <Text style={{ color: '#6C757D', marginTop: 4 }}>Try a different search term</Text>
        </View>
      )}

      {/* List — flex:1 is crucial so it fills remaining space */}
      {!loading && !error && filtered.length > 0 && (
        <FlatList
          style={{ flex: 1 }}
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => navigation.navigate('ProductDetail', {
                categoryId,
                itemId: item.id,
              })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchWrapper: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
