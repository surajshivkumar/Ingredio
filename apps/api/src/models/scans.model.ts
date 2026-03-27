import { boolean, index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.model";
import { item } from "./item.model";

export const scans = pgTable("scans", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    product_id: uuid("product_id").notNull().references(() => item.id),
    scan_success: boolean("scan_success").notNull(),
    in_review: boolean("in_review").notNull(),
    scanned_at: timestamp("scanned_at").defaultNow(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
}, (t) => [
    index("scans_user_id_idx").on(t.user_id),
    index("scans_product_id_idx").on(t.product_id),
]);
