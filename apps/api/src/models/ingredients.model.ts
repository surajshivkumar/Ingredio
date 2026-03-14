import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const ingredients = pgTable("ingredients", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    ingredient_score: integer("ingredient_score").notNull(),
    ingredient_remark: varchar("ingredient_remark", { length: 255 }).notNull(),
    is_artificial: boolean("is_artificial").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});