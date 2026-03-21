import BaseRepository from "./base.repository";
import { brand } from "../models/brand.model";

export class BrandRepository extends BaseRepository<typeof brand> {
  constructor() {
    super(brand, brand.id);
  }
}

export const brandRepository = new BrandRepository();
