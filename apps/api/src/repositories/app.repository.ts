import BaseRepository from "./base.repository";
import { app } from "../models/app.model";

export class AppRepository extends BaseRepository<typeof app> {
  constructor() {
    super(app, app.id);
  }
}

export const appRepository = new AppRepository();
