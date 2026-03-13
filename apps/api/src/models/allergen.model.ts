import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const allergen = pgTable("allergen", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    icon: varchar("icon", { length: 255 }),
    severity_level: varchar("severity_level", { length: 50 }),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
