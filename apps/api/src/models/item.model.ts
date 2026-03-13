import { integer, pgTable, real, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { category } from "./category.model";
import { brand } from "./brand.model";

export const item = pgTable("item", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    barcode: varchar("barcode", { length: 50 }).notNull().unique(),
    category_id: uuid("category_id").notNull().references(() => category.id),
    brand_id: uuid("brand_id").notNull().references(() => brand.id),
    item_score: integer("item_score").notNull(),

    // Nutritional data per 100g
    calories_per_100g: real("calories_per_100g"),
    fat_per_100g: real("fat_per_100g"),
    saturated_fat_per_100g: real("saturated_fat_per_100g"),
    sugar_per_100g: real("sugar_per_100g"),
    salt_per_100g: real("salt_per_100g"),
    fiber_per_100g: real("fiber_per_100g"),
    protein_per_100g: real("protein_per_100g"),
    nutri_score: varchar("nutri_score", { length: 5 }),
    nova_group: integer("nova_group"),

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});