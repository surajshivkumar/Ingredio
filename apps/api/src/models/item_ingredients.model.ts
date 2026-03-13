import { integer, pgTable, real, timestamp, uuid } from "drizzle-orm/pg-core";
import { item } from "./item.model";
import { ingredients } from "./ingredients.model";

export const item_ingredients = pgTable("item_ingredients", {
    id: uuid("id").primaryKey().defaultRandom(),
    item_id: uuid("item_id").notNull().references(() => item.id),
    ingredient_id: uuid("ingredient_id").notNull().references(() => ingredients.id),
    position: integer("position"),
    percentage: real("percentage"),
    created_at: timestamp("created_at").defaultNow(),
});
