import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const brand = pgTable("brand", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    logo: varchar("logo", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
