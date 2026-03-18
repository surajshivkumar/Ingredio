import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/index";
import {
    allergen,
    brand,
    category,
    ingredients,
    item,
    item_allergens,
    item_ingredients,
} from "../models/schema";

export class ProductService {
    async getItemsByCategory(categoryId: string) {
        return db
            .select({
                id: item.id,
                name: item.name,
                barcode: item.barcode,
                item_score: item.item_score,
                nutri_score: item.nutri_score,
                nova_group: item.nova_group,
                image_front_url: item.image_front_url,
                calories_per_100g: item.calories_per_100g,
                brand_name: brand.name,
                category:category
            })
            .from(item)
            .innerJoin(brand, eq(item.brand_id, brand.id))
            .innerJoin(category, eq(item.category_id, category.id))
            .where(eq(item.category_id, categoryId));
    }

    async getItemById(categoryId: string, itemId: string) {
        const rows = await db
            .select({
                item: item,
                brand: brand,
                category: category,
                item_ingredient_id: item_ingredients.id,
                item_ingredient_position: item_ingredients.position,
                item_ingredient_percentage: item_ingredients.percentage,
                ingredient: ingredients,
                item_allergen_id: item_allergens.id,
                allergen: allergen,
            })
            .from(item)
            .innerJoin(brand, eq(item.brand_id, brand.id))
            .innerJoin(category, eq(item.category_id, category.id))
            .leftJoin(item_ingredients, eq(item_ingredients.item_id, item.id))
            .leftJoin(ingredients, eq(item_ingredients.ingredient_id, ingredients.id))
            .leftJoin(item_allergens, eq(item_allergens.item_id, item.id))
            .leftJoin(allergen, eq(item_allergens.allergen_id, allergen.id))
            .where(and(eq(item.id, itemId), eq(item.category_id, categoryId)))
            .orderBy(asc(item_ingredients.position));

        if (rows.length === 0) return null;

        const first = rows[0];
        const ingredientMap = new Map<string, object>();
        const allergenMap = new Map<string, object>();

        for (const row of rows) {
            if (row.ingredient && row.item_ingredient_id && !ingredientMap.has(row.item_ingredient_id)) {
                ingredientMap.set(row.item_ingredient_id, {
                    name: row.ingredient.name,
                    percentage: row.item_ingredient_percentage,
                    is_artificial: row.ingredient.is_artificial,
                });
            }
            if (row.allergen && row.item_allergen_id && !allergenMap.has(row.item_allergen_id)) {
                allergenMap.set(row.item_allergen_id, { name: row.allergen.name });
            }
        }

        return {
            ...first.item,
            brand: first.brand,
            category: first.category,
            item_ingredients: Array.from(ingredientMap.values()),
            item_allergens: Array.from(allergenMap.values()),
        };
    }
}
