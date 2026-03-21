import BaseRepository from "./base.repository";
import { user_preferences } from "../models/user_preferences.model";

export class UserPreferencesRepository extends BaseRepository<typeof user_preferences> {
  constructor() {
    super(user_preferences, user_preferences.id);
  }
}

export const userPreferencesRepository = new UserPreferencesRepository();
