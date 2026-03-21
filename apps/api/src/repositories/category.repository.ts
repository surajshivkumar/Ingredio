import { asc } from "drizzle-orm";
import BaseRepository from "./base.repository";
import { category } from "../models/category.model";
import { db } from "../db";

export class CategoryRepository extends BaseRepository<typeof category> {
  constructor() {
    super(category, category.id);
  }

  async findAllOrdered() {
    return (this.db as any)
      .select({ id: category.id, name: category.name, logo: category.logo })
      .from(category)
      .orderBy(asc(category.name));
  }
}

export const categoryRepository = new CategoryRepository();
