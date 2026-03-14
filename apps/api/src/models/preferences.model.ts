import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const preferences = pgTable("preferences", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    flag: boolean("flag").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});