import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const app = pgTable("app", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    version: varchar("version", { length: 50 }).notNull(),
    device_type: varchar("device_type", { length: 50 }).notNull(),
    build: varchar("build", { length: 50 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});