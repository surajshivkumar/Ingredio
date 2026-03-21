import BaseRepository from "./base.repository";
import { box_category } from "../models/box.category";

export class BoxCategoryRepository extends BaseRepository<typeof box_category> {
  constructor() {
    super(box_category, box_category.id);
  }
}

export const boxCategoryRepository = new BoxCategoryRepository();
