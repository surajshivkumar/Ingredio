import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { brand } from "./brand.model";
import { category } from "./category.model";

export const brand_categories = pgTable("brand_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    brand_id: uuid("brand_id").notNull().references(() => brand.id),
    category_id: uuid("category_id").notNull().references(() => category.id),
    created_at: timestamp("created_at").defaultNow(),
});
