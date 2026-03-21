import BaseRepository from "./base.repository";
import { item_ingredients } from "../models/item_ingredients.model";

export class ItemIngredientsRepository extends BaseRepository<typeof item_ingredients> {
  constructor() {
    super(item_ingredients, item_ingredients.id);
  }
}

export const itemIngredientsRepository = new ItemIngredientsRepository();
