import BaseRepository from "./base.repository";
import { user_devices } from "../models/user_devices.model";

export class UserDevicesRepository extends BaseRepository<typeof user_devices> {
  constructor() {
    super(user_devices, user_devices.id);
  }
}

export const userDevicesRepository = new UserDevicesRepository();
