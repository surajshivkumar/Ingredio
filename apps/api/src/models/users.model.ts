import { boolean, date, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 255 }).notNull().unique(),
    country_code: varchar("country_code", { length: 10 }).notNull(),
    password_hash: varchar("password_hash", { length: 255 }).notNull(),
    premium_user: boolean("premium_user").default(false),
    date_of_birth: date("date_of_birth"),
    gender: varchar("gender", { length: 50 }).notNull(),
    height: integer("height"),
    weight: integer("weight"),
    avatar_url: text("avatar_url"),
    subscription_start_date: timestamp("subscription_start_date"),
    subscription_end_date: timestamp("subscription_end_date"),
    user_app_version: varchar("user_app_version", { length: 50 }),
    last_logged_in: timestamp("last_logged_in").defaultNow(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});