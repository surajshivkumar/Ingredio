import { sql } from "drizzle-orm";
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
import { CATEGORY_ALIASES } from "./categoryAliases";
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

function normalizeCategoryName(raw: string | undefined): string {
    if (!raw) return "Uncategorized";
    const segments = raw.split(",").map(s => s.trim()).filter(s => s.length >= 2);
    const valid = segments.filter(s => !/^[\d.,\s\-+%]+$/.test(s) && !/^\d{6,}$/.test(s));
    for (let i = valid.length - 1; i >= 0; i--) {
        const alias = CATEGORY_ALIASES[valid[i].toLowerCase()];
        if (alias) return alias;
    }
    return "Uncategorized";
}

async function seed() {
    console.log("Seeding database...");

    console.log("Truncating tables...");
    await db.execute(sql`
        TRUNCATE TABLE item_allergens, item_ingredients, scans, brand_categories,
        item, brand, category, ingredients, allergen, preferences, box_category,
        reviewer, users, app RESTART IDENTITY CASCADE
    `);
    console.log("Tables truncated.");

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
        const categoryName = normalizeCategoryName(product.categories as string | undefined);
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

    console.log(`Read ${products.length} products`);

    // ── Pass 2: Batch inserts ─────────────────────────────────────────────────

    // 1–4. Brands, categories, ingredients, allergens (independent — run in parallel)
    const insertChunks = async <T>(table: any, rows: T[], opts?: { onConflict?: boolean }) => {
        const results: any[] = [];
        for (const ch of chunk(rows, CHUNK)) {
            let q = db.insert(table).values(ch as any);
            if (opts?.onConflict) q = (q as any).onConflictDoNothing();
            results.push(...await (q as any).returning());
        }
        return results;
    };

    const [brandRows, categoryRows, ingredientRows, allergenRows] = await Promise.all([
        insertChunks(brand, [...uniqueBrands].map(name => ({ name, logo: "" }))),
        insertChunks(category, [...uniqueCategories].map(name => ({ name, logo: "" })), { onConflict: true }),
        insertChunks(ingredients, [...uniqueIngredients].map(name => ({
            name, description: "", ingredient_score: 0, ingredient_remark: "", is_artificial: false,
        }))),
        insertChunks(allergen, [...uniqueAllergens].map(name => ({ name, icon: null, severity_level: null })), { onConflict: true }),
    ]);

    const brandCache = new Map<string, string>(brandRows.map((r: any) => [r.name, r.id]));
    const categoryCache = new Map<string, string>(categoryRows.map((r: any) => [r.name, r.id]));
    const ingredientCache = new Map<string, string>(ingredientRows.map((r: any) => [r.name, r.id]));
    const allergenCache = new Map<string, string>(allergenRows.map((r: any) => [r.name, r.id]));

    console.log(`Brands (${brandCache.size}), Categories (${categoryCache.size}), Ingredients (${ingredientCache.size}), Allergens (${allergenCache.size}) seeded`);

    // 5. Brand-category pairs
    const brandCategoryValues = products.map(p => ({
        brand_id: brandCache.get(p.brandName)!,
        category_id: categoryCache.get(p.categoryName)!,
    }));
    for (const ch of chunk(brandCategoryValues, CHUNK)) {
        await db.insert(brand_categories).values(ch).onConflictDoNothing();
    }
    console.log("Brand-category pairs seeded");

    // 6. Items
    const itemCache = new Map<string, string>();
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
    const itemIngredientValues = products.flatMap(p => {
        const itemId = itemCache.get(p.barcode);
        if (!itemId) return [];
        return p.ingredientList.flatMap((ing, i) => {
            const ingredientId = ingredientCache.get(ing.text);
            return ingredientId ? [{ item_id: itemId, ingredient_id: ingredientId, position: i, percentage: ing.percent_estimate ?? null }] : [];
        });
    });
    for (const ch of chunk(itemIngredientValues, CHUNK)) {
        await db.insert(item_ingredients).values(ch).onConflictDoNothing();
    }
    console.log(`Item ingredients seeded (${itemIngredientValues.length})`);

    // 8. Item allergens
    const itemAllergenValues = products.flatMap(p => {
        const itemId = itemCache.get(p.barcode);
        if (!itemId) return [];
        return p.allergenTags.flatMap(tag => {
            const allergenId = allergenCache.get(tag);
            return allergenId ? [{ item_id: itemId, allergen_id: allergenId }] : [];
        });
    });
    for (const ch of chunk(itemAllergenValues, CHUNK)) {
        await db.insert(item_allergens).values(ch).onConflictDoNothing();
    }
    console.log(`Item allergens seeded (${itemAllergenValues.length})`);

    // 9. Preferences
    const preferenceSet = new Set(products.flatMap(p => p.prefTags));
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
