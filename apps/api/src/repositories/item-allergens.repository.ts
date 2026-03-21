import BaseRepository from "./base.repository";
import { item_allergens } from "../models/item_allergens.model";

export class ItemAllergensRepository extends BaseRepository<typeof item_allergens> {
  constructor() {
    super(item_allergens, item_allergens.id);
  }
}

export const itemAllergensRepository = new ItemAllergensRepository();
