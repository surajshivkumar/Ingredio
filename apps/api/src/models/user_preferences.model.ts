import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.model";
import { preferences } from "./preferences.model";

export const user_preferences = pgTable("user_preferences", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    preference_id: uuid("preference_id").notNull().references(() => preferences.id),
    created_at: timestamp("created_at").defaultNow(),
});
