import { and, asc, eq, gt } from "drizzle-orm";
import BaseRepository from "./base.repository";
import { item } from "../models/item.model";
import { brand } from "../models/brand.model";
import { category } from "../models/category.model";
import { item_ingredients } from "../models/item_ingredients.model";
import { ingredients } from "../models/ingredients.model";
import { item_allergens } from "../models/item_allergens.model";
import { allergen } from "../models/allergen.model";
import { PaginationParams, PaginatedResponse } from "../types/pagination";

export class ItemRepository extends BaseRepository<typeof item> {
  constructor() {
    super(item, item.id);
  }

  async findByBarcode(barcode: string) {
    const [result] = await (this.db as any).select().from(item).where(eq(item.barcode, barcode));
    return result || null;
  }

  async findManyByCategory(categoryId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const { cursor } = pagination;
    const PAGE_SIZE = 20;
    const SMART_LAST_PAGE_THRESHOLD = 10;
    
    const itemsQuery = (this.db as any)
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
        category: category,
      })
      .from(item)
      .innerJoin(brand, eq(item.brand_id, brand.id))
      .innerJoin(category, eq(item.category_id, category.id))
      .orderBy(asc(item.id))
      .limit(PAGE_SIZE + SMART_LAST_PAGE_THRESHOLD + 1);

    if (cursor) {
      itemsQuery.where(and(eq(item.category_id, categoryId), gt(item.id, cursor)));
    } else {
      itemsQuery.where(eq(item.category_id, categoryId));
    }

    const items = await itemsQuery;
    let paginatedItems = items;
    let nextCursor: string | null = null;
    let hasMore = false;

    if (items.length > PAGE_SIZE) {
      const extras = items.slice(PAGE_SIZE);
      
      if (extras.length <= SMART_LAST_PAGE_THRESHOLD) {
        paginatedItems = items.slice(0, PAGE_SIZE + extras.length);
        hasMore = false;
      } else {
        paginatedItems = items.slice(0, PAGE_SIZE);
        nextCursor = paginatedItems[paginatedItems.length - 1].id;
        hasMore = true;
      }
    }

    return {
      items: paginatedItems,
      pagination: {
        nextCursor,
        hasMore,
      },
    };
  }

  async findByIdWithRelations(categoryId: string, itemId: string) {
    const rows = await (this.db as any)
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

export const itemRepository = new ItemRepository();
