import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.model";
import { scans } from "./scans.model";
import { reviewer } from "./reviewer.model";

export const review = pgTable("review", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    scan_id: uuid("scan_id").notNull().references(() => scans.id),
    reviewer_id: uuid("reviewer_id").notNull().references(() => reviewer.id),
    review_text: varchar("review_text", { length: 255 }).notNull(),
    review_status: varchar("review_status", { length: 50 }).notNull(),
    review_score: integer("review_score").notNull(),
    review_score_reason: varchar("review_score_reason", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});