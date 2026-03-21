import BaseRepository from "./base.repository";
import { box } from "../models/box.model";

export class BoxRepository extends BaseRepository<typeof box> {
  constructor() {
    super(box, box.id);
  }
}

export const boxRepository = new BoxRepository();
