import BaseRepository from "./base.repository";
import { scan_images } from "../models/scan_images.model";

export class ScanImagesRepository extends BaseRepository<typeof scan_images> {
  constructor() {
    super(scan_images, scan_images.id);
  }
}

export const scanImagesRepository = new ScanImagesRepository();
