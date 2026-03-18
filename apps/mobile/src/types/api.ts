// Shared types for the mobile app matching the API response shapes

export interface Category {
  id: string;       // UUID from DB
  name: string;
  logo: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  barcode: string | null;
  item_score: number | null;
  nutri_score: string | null;
  nova_group: number | null;
  image_front_url: string | null;
  calories_per_100g: number | null;
  brand_name: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  barcode: string;
  item_score: number;
  nutri_score: string | null;
  nova_group: number | null;
  // Images
  image_front_url: string | null;
  image_ingredients_url: string | null;
  image_nutrition_url: string | null;
  image_packaging_url: string | null;
  // Macros per 100g
  calories_per_100g: number | null;
  fat_per_100g: number | null;
  saturated_fat_per_100g: number | null;
  sugar_per_100g: number | null;
  salt_per_100g: number | null;
  fiber_per_100g: number | null;
  protein_per_100g: number | null;
  // Relations
  brand: { id: string; name: string };
  category: { id: string; name: string };
  item_ingredients: { name: string; percentage: number | null; is_artificial: boolean }[];
  item_allergens: { name: string }[];
}
