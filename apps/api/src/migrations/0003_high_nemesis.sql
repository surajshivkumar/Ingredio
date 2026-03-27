CREATE INDEX "item_category_id_idx" ON "item" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "item_allergens_item_id_idx" ON "item_allergens" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "item_ingredients_item_id_idx" ON "item_ingredients" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "scans_user_id_idx" ON "scans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scans_product_id_idx" ON "scans" USING btree ("product_id");