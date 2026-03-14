import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { scans } from "./scans.model";

export const scan_images = pgTable("scan_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    scan_id: uuid("scan_id").notNull().references(() => scans.id),
    image_type: varchar("image_type", { length: 50 }).notNull(),
    image_url: text("image_url").notNull(),
    ocr_text: text("ocr_text"),
    created_at: timestamp("created_at").defaultNow(),
});
