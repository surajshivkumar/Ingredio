import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.model";
import { allergen } from "./allergen.model";

export const user_allergens = pgTable("user_allergens", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    allergen_id: uuid("allergen_id").notNull().references(() => allergen.id),
    created_at: timestamp("created_at").defaultNow(),
});
