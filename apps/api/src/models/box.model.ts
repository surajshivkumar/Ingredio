import { integer, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.model";
import { box_category } from "./box.category";

export const box = pgTable("box", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    box_category_id: uuid("box_category_id").notNull().references(() => box_category.id),
    box_items: jsonb("box_items").notNull(),
    box_category_scores: jsonb("box_category_scores").notNull(),
    box_score: integer("box_score").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});