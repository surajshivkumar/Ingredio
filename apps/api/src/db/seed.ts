import { db, pool } from "./index";
import {
    brand,
    category,
    item,
    ingredients,
    allergen,
    item_ingredients,
    item_allergens,
    preferences,
    box_category,
    brand_categories,
    reviewer,
    users,
    app,
} from "../models/schema";
import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";

const JSONL_PATH = path.resolve(__dirname, "../../../../data/pipeline/india_products_cleaned.jsonl");
const CHUNK = 200;

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

type ProductData = {
    barcode: string;
    name: string;
    brandName: string;
    categoryName: string;
    nutriments: Record<string, any>;
    nutriscore: string | null;
    nova_group: number | null;
    image_front_url: string | null;
    image_ingredients_url: string | null;
    image_nutrition_url: string | null;
    image_packaging_url: string | null;
    ingredientList: { text: string; percent_estimate?: number }[];
    allergenTags: string[];
    prefTags: string[];
};

async function seed() {
    console.log("Seeding database...");

    // ── Pass 1: Read all products into memory ─────────────────────────────────
    const products: ProductData[] = [];
    const uniqueBrands = new Set<string>();
    const uniqueCategories = new Set<string>();
    const uniqueIngredients = new Set<string>();
    const uniqueAllergens = new Set<string>();

    const rl = readline.createInterface({
        input: fs.createReadStream(JSONL_PATH),
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        if (!line.trim()) continue;
        let product: Record<string, any>;
        try { product = JSON.parse(line); } catch { continue; }

        const barcode = product.code;
        const name = product.product_name || product.brands || "";
        if (!barcode || !name) continue;

        const brandName = product.brands || "Unknown";
        const categoryName = (product.categories as string | undefined)?.split(",")[0]?.trim() || "Uncategorized";
        const ingredientList = (product.ingredients ?? [])
            .filter((ing: any) => ing.text && (ing.text as string).length <= 255)
            .map((ing: any) => ({ text: ing.text as string, percent_estimate: ing.percent_estimate }));
        const allergenTags: string[] = product.allergens_tags ?? [];
        const prefTags: string[] = [
            ...(product.labels_tags ?? []),
            ...(product.ingredients_analysis_tags ?? []),
        ];

        uniqueBrands.add(brandName);
        uniqueCategories.add(categoryName);
        ingredientList.forEach((ing: any) => uniqueIngredients.add(ing.text));
        allergenTags.forEach((tag: string) => uniqueAllergens.add(tag));

        products.push({
            barcode, name, brandName, categoryName,
            nutriments: product.nutriments ?? {},
            nutriscore: ["a","b","c","d","e"].includes(product.nutriscore_grade) ? product.nutriscore_grade : null,
            nova_group: product.nova_group ?? null,
            image_front_url: product.image_front_url ?? null,
            image_ingredients_url: product.image_ingredients_url ?? null,
            image_nutrition_url: product.image_nutrition_url ?? null,
            image_packaging_url: product.image_packaging_url ?? null,
            ingredientList, allergenTags, prefTags,
        });
    }

    console.log(`📦 Read ${products.length} products`);

    // ── Pass 2: Batch inserts ─────────────────────────────────────────────────

    // 1. Brands
    const brandCache = new Map<string, string>();
    for (const ch of chunk([...uniqueBrands], CHUNK)) {
        const rows = await db.insert(brand).values(ch.map(name => ({ name, logo: "" }))).returning();
        rows.forEach(row => brandCache.set(row.name, row.id));
    }
    console.log(`Brands seeded (${brandCache.size})`);

    // 2. Categories
    const categoryCache = new Map<string, string>();
    for (const ch of chunk([...uniqueCategories], CHUNK)) {
        const rows = await db.insert(category).values(ch.map(name => ({ name, logo: "" }))).returning();
        rows.forEach(row => categoryCache.set(row.name, row.id));
    }
    console.log(`Categories seeded (${categoryCache.size})`);

    // 3. Ingredients
    const ingredientCache = new Map<string, string>();
    for (const ch of chunk([...uniqueIngredients], CHUNK)) {
        const rows = await db.insert(ingredients).values(
            ch.map(name => ({ name, description: "", ingredient_score: 0, ingredient_remark: "", is_artificial: false }))
        ).returning();
        rows.forEach(row => ingredientCache.set(row.name, row.id));
    }
    console.log(`Ingredients seeded (${ingredientCache.size})`);

    // 4. Allergens
    const allergenCache = new Map<string, string>();
    for (const ch of chunk([...uniqueAllergens], CHUNK)) {
        const rows = await db.insert(allergen).values(
            ch.map(name => ({ name, icon: null, severity_level: null }))
        ).onConflictDoNothing().returning();
        rows.forEach(row => allergenCache.set(row.name, row.id));
    }
    console.log(`Allergens seeded (${allergenCache.size})`);

    // 5. Brand-category pairs
    const brandCategoryPairs = new Set<string>();
    const brandCategoryValues: { brand_id: string; category_id: string }[] = [];
    for (const p of products) {
        const key = `${brandCache.get(p.brandName)}:${categoryCache.get(p.categoryName)}`;
        if (!brandCategoryPairs.has(key)) {
            brandCategoryPairs.add(key);
            brandCategoryValues.push({ brand_id: brandCache.get(p.brandName)!, category_id: categoryCache.get(p.categoryName)! });
        }
    }
    for (const ch of chunk(brandCategoryValues, CHUNK)) {
        await db.insert(brand_categories).values(ch).onConflictDoNothing();
    }
    console.log(`Brand-category pairs seeded (${brandCategoryPairs.size})`);

    // 6. Items
    const itemCache = new Map<string, string>(); // barcode → id
    for (const ch of chunk(products, CHUNK)) {
        const rows = await db.insert(item).values(ch.map(p => ({
            name: p.name,
            description: p.name,
            barcode: p.barcode,
            brand_id: brandCache.get(p.brandName)!,
            category_id: categoryCache.get(p.categoryName)!,
            item_score: 0,
            calories_per_100g: p.nutriments["energy-kcal_100g"] ?? null,
            fat_per_100g: p.nutriments["fat_100g"] ?? null,
            saturated_fat_per_100g: p.nutriments["saturated-fat_100g"] ?? null,
            sugar_per_100g: p.nutriments["sugars_100g"] ?? null,
            salt_per_100g: p.nutriments["salt_100g"] ?? null,
            fiber_per_100g: p.nutriments["fiber_100g"] ?? null,
            protein_per_100g: p.nutriments["proteins_100g"] ?? null,
            nutri_score: p.nutriscore,
            nova_group: p.nova_group,
            image_front_url: p.image_front_url,
            image_ingredients_url: p.image_ingredients_url,
            image_nutrition_url: p.image_nutrition_url,
            image_packaging_url: p.image_packaging_url,
        }))).onConflictDoNothing().returning();
        rows.forEach(row => itemCache.set(row.barcode, row.id));
    }
    console.log(`Items seeded (${itemCache.size})`);

    // 7. Item ingredients
    const itemIngredientValues: { item_id: string; ingredient_id: string; position: number; percentage: number | null }[] = [];
    for (const p of products) {
        const itemId = itemCache.get(p.barcode);
        if (!itemId) continue;
        for (let i = 0; i < p.ingredientList.length; i++) {
            const ingredientId = ingredientCache.get(p.ingredientList[i].text);
            if (!ingredientId) continue;
            itemIngredientValues.push({ item_id: itemId, ingredient_id: ingredientId, position: i, percentage: p.ingredientList[i].percent_estimate ?? null });
        }
    }
    for (const ch of chunk(itemIngredientValues, CHUNK)) {
        await db.insert(item_ingredients).values(ch).onConflictDoNothing();
    }
    console.log(`Item ingredients seeded (${itemIngredientValues.length})`);

    // 8. Item allergens
    const itemAllergenValues: { item_id: string; allergen_id: string }[] = [];
    const seenPairs = new Set<string>();
    for (const p of products) {
        const itemId = itemCache.get(p.barcode);
        if (!itemId) continue;
        for (const tag of p.allergenTags) {
            const allergenId = allergenCache.get(tag);
            if (!allergenId) continue;
            const key = `${itemId}:${allergenId}`;
            if (!seenPairs.has(key)) {
                seenPairs.add(key);
                itemAllergenValues.push({ item_id: itemId, allergen_id: allergenId });
            }
        }
    }
    for (const ch of chunk(itemAllergenValues, CHUNK)) {
        await db.insert(item_allergens).values(ch).onConflictDoNothing();
    }
    console.log(`Item allergens seeded (${itemAllergenValues.length})`);

    // 9. Preferences
    const preferenceSet = new Set<string>();
    products.forEach(p => p.prefTags.forEach(tag => preferenceSet.add(tag)));
    for (const ch of chunk([...preferenceSet], CHUNK)) {
        await db.insert(preferences).values(ch.map(tag => ({ name: tag, description: "", flag: false }))).onConflictDoNothing();
    }
    console.log(`Preferences seeded (${preferenceSet.size})`);

    // 10. Box categories
    await db.insert(box_category).values([
        { name: "Weekly Groceries" },
        { name: "Breakfast" },
        { name: "Snacks" },
        { name: "Kids" },
        { name: "Fitness" },
        { name: "Personal Care" },
    ]).onConflictDoNothing();
    console.log("Box categories seeded");

    // 11. Reviewers
    await db.insert(reviewer).values([
        { name: "Admin", email: "admin@ingredio.in", role: "admin" },
    ]).onConflictDoNothing();
    console.log("Reviewers seeded");

    // 12. Users
    await db.insert(users).values([
        { name: "Piyush Sharma", email: "psharma@gmail.com", phone: "9999999999", country_code: "+91", password_hash: "test", gender: "male", premium_user: false },
        { name: "Sachin Sood", email: "ssood@apple.com", phone: "8888888888", country_code: "+91", password_hash: "test", gender: "female", premium_user: true, subscription_start_date: new Date("2026-01-01"), subscription_end_date: new Date("2027-01-01") },
    ]).onConflictDoNothing();
    console.log("Users seeded");

    // 13. App
    await db.insert(app).values([
        { name: "Ingredio", version: "1.0.0", device_type: "ios", build: "1" },
        { name: "Ingredio", version: "1.0.0", device_type: "android", build: "1" },
    ]).onConflictDoNothing();
    console.log("App seeded");

    console.log(`\nSeeding complete — ${products.length} products.`);
    await pool.end();
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
