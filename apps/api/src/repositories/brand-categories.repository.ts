import BaseRepository from "./base.repository";
import { brand_categories } from "../models/brand_categories.model";

export class BrandCategoriesRepository extends BaseRepository<typeof brand_categories> {
  constructor() {
    super(brand_categories, brand_categories.id);
  }
}

export const brandCategoriesRepository = new BrandCategoriesRepository();
