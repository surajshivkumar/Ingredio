import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const reviewer = pgTable("reviewer", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique(),
    role: varchar("role", { length: 100 }),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});