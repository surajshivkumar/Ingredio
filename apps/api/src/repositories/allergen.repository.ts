import BaseRepository from "./base.repository";
import { allergen } from "../models/allergen.model";

export class AllergenRepository extends BaseRepository<typeof allergen> {
  constructor() {
    super(allergen, allergen.id);
  }
}

export const allergenRepository = new AllergenRepository();
