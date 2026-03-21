import BaseRepository from "./base.repository";
import { user_allergens } from "../models/user_allergens.model";

export class UserAllergensRepository extends BaseRepository<typeof user_allergens> {
  constructor() {
    super(user_allergens, user_allergens.id);
  }
}

export const userAllergensRepository = new UserAllergensRepository();
