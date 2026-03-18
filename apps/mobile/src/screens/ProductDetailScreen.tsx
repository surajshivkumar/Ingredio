import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, SafeAreaView,
  StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItemById } from '../services/products.service';
import { ProductDetail } from '../types/api';

interface Props {
  route: { params: { categoryId: string; itemId: string } };
  navigation: any;
}

// ── Small helpers ────────────────────────────────────────────────────
function MacroRow({ label, value, unit = 'g' }: { label: string; value: number | null; unit?: string }) {
  if (value == null) return null;
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value.toFixed(1)}{unit}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// ── Screen ───────────────────────────────────────────────────────────
export default function ProductDetailScreen({ route, navigation }: Props) {
  const { categoryId, itemId } = route.params;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItemById(categoryId, itemId)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [itemId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>😕</Text>
          <Text style={styles.errorText}>{error ?? 'Product not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const artificialIngredients = product.item_ingredients.filter(i => i.is_artificial);
  const naturalIngredients    = product.item_ingredients.filter(i => !i.is_artificial);
  const hasNutrition = [
    product.calories_per_100g, product.fat_per_100g, product.protein_per_100g,
    product.sugar_per_100g, product.salt_per_100g, product.fiber_per_100g,
  ].some(v => v != null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#212529" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero image */}
        {product.image_front_url ? (
          <Image
            source={{ uri: product.image_front_url }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 64 }}>📦</Text>
          </View>
        )}

        {/* Name + brand */}
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.brandName}>{product.brand.name}</Text>
        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        {/* Tags */}
        <View style={styles.tagRow}>
          {product.category.name ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.category.name}</Text>
            </View>
          ) : null}
          {product.nova_group != null && (
            <View style={[styles.tag, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.tagText, { color: '#1565C0' }]}>NOVA {product.nova_group}</Text>
            </View>
          )}
          {product.nutri_score != null && (
            <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.tagText, { color: '#2E7D32' }]}>Nutri-Score {product.nutri_score.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Nutrition table */}
        {hasNutrition && (
          <View style={styles.card}>
            <SectionTitle title="Nutrition per 100g" />
            <MacroRow label="Calories"       value={product.calories_per_100g} unit=" kcal" />
            <MacroRow label="Fat"            value={product.fat_per_100g} />
            <MacroRow label="Saturated fat"  value={product.saturated_fat_per_100g} />
            <MacroRow label="Sugar"          value={product.sugar_per_100g} />
            <MacroRow label="Fiber"          value={product.fiber_per_100g} />
            <MacroRow label="Protein"        value={product.protein_per_100g} />
            <MacroRow label="Salt"           value={product.salt_per_100g} />
          </View>
        )}

        {/* Allergens */}
        {product.item_allergens.length > 0 && (
          <View style={styles.card}>
            <SectionTitle title="⚠️  Allergens" />
            <View style={styles.chipRow}>
              {product.item_allergens.map((a, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={[styles.chipText, { color: '#E65100' }]}>{a.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Artificial ingredients */}
        {artificialIngredients.length > 0 && (
          <View style={styles.card}>
            <SectionTitle title="🧪  Artificial Ingredients" />
            <View style={styles.chipRow}>
              {artificialIngredients.map((ing, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: '#FCE4EC' }]}>
                  <Text style={[styles.chipText, { color: '#C62828' }]}>{ing.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* All ingredients */}
        {product.item_ingredients.length > 0 && (
          <View style={styles.card}>
            <SectionTitle title="Ingredients" />
            <Text style={styles.ingredientList}>
              {product.item_ingredients.map((ing, i) => (
                <Text key={i}>
                  <Text style={ing.is_artificial ? styles.artificial : styles.natural}>
                    {ing.name}
                  </Text>
                  {i < product.item_ingredients.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </Text>
          </View>
        )}

        {/* Barcode */}
        <Text style={styles.barcode}>Barcode: {product.barcode}</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F8F9FA' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:       { paddingBottom: 60 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  heroImage: {
    width: '100%', height: 280,
    backgroundColor: '#FFFFFF',
  },
  heroPlaceholder: {
    alignItems: 'center', justifyContent: 'center',
  },
  productName: {
    fontSize: 22, fontWeight: '900', color: '#212529',
    paddingHorizontal: 20, marginTop: 20,
  },
  brandName: {
    fontSize: 14, color: '#4CAF50', fontWeight: '700',
    paddingHorizontal: 20, marginTop: 4,
  },
  description: {
    fontSize: 13, color: '#6C757D', lineHeight: 20,
    paddingHorizontal: 20, marginTop: 8,
  },
  tagRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 20, marginTop: 12,
  },
  tag: {
    backgroundColor: '#F0F0F0', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { fontSize: 12, fontWeight: '600', color: '#555' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    marginHorizontal: 16, marginTop: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: '#212529', marginBottom: 12,
  },
  macroRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  macroLabel: { fontSize: 14, color: '#495057' },
  macroValue: { fontSize: 14, fontWeight: '700', color: '#212529' },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:       { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  chipText:   { fontSize: 12, fontWeight: '600' },
  ingredientList: { fontSize: 13, color: '#495057', lineHeight: 22 },
  artificial: { color: '#C62828', fontWeight: '700' },
  natural:    { color: '#495057' },
  barcode: {
    fontSize: 12, color: '#ADB5BD', textAlign: 'center', marginTop: 20,
  },
  errorText:  { fontSize: 14, color: '#6C757D', marginTop: 8, textAlign: 'center' },
});
