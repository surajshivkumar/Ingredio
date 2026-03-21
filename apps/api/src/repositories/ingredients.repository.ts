import BaseRepository from "./base.repository";
import { ingredients } from "../models/ingredients.model";

export class IngredientsRepository extends BaseRepository<typeof ingredients> {
  constructor() {
    super(ingredients, ingredients.id);
  }
}

export const ingredientsRepository = new IngredientsRepository();
