import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.model";

export const user_devices = pgTable("user_devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    device_name: varchar("device_name", { length: 255 }).notNull(),
    device_type: varchar("device_type", { length: 100 }).notNull(),
    device_os: varchar("device_os", { length: 100 }).notNull(),
    push_token: varchar("push_token", { length: 255 }),
    last_active_at: timestamp("last_active_at").defaultNow(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
