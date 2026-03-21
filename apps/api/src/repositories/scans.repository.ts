import BaseRepository from "./base.repository";
import { scans } from "../models/scans.model";

export class ScansRepository extends BaseRepository<typeof scans> {
  constructor() {
    super(scans, scans.id);
  }
}

export const scansRepository = new ScansRepository();
