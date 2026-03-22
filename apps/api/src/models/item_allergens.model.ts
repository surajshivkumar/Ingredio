import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { item } from "./item.model";
import { allergen } from "./allergen.model";

export const item_allergens = pgTable("item_allergens", {
    id: uuid("id").primaryKey().defaultRandom(),
    item_id: uuid("item_id").notNull().references(() => item.id),
    allergen_id: uuid("allergen_id").notNull().references(() => allergen.id),
    created_at: timestamp("created_at").defaultNow(),
}, (t) => [
    index("item_allergens_item_id_idx").on(t.item_id),
]);
