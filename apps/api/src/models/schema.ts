// ─── Core Tables ─────────────────────────────────────────
export { app } from "./app.model";
export { users } from "./users.model";
export { category } from "./category.model";
export { brand } from "./brand.model";
export { preferences } from "./preferences.model";
export { allergen } from "./allergen.model";
export { ingredients } from "./ingredients.model";
export { reviewer } from "./reviewer.model";
export { box_category } from "./box.category";

// ─── Entity Tables ───────────────────────────────────────
export { item } from "./item.model";
export { scans } from "./scans.model";
export { review } from "./review.model";
export { box } from "./box.model";

// ─── Junction / Child Tables ─────────────────────────────
export { user_devices } from "./user_devices.model";
export { user_preferences } from "./user_preferences.model";
export { user_allergens } from "./user_allergens.model";
export { brand_categories } from "./brand_categories.model";
export { item_ingredients } from "./item_ingredients.model";
export { item_allergens } from "./item_allergens.model";
export { scan_images } from "./scan_images.model";
