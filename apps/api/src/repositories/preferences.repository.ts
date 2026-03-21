import BaseRepository from "./base.repository";
import { preferences } from "../models/preferences.model";

export class PreferencesRepository extends BaseRepository<typeof preferences> {
  constructor() {
    super(preferences, preferences.id);
  }
}

export const preferencesRepository = new PreferencesRepository();
