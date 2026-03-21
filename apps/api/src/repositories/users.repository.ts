import { eq } from "drizzle-orm";
import BaseRepository from "./base.repository";
import { users } from "../models/users.model";

export class UsersRepository extends BaseRepository<typeof users> {
  constructor() {
    super(users, users.id);
  }

  async findByEmail(email: string) {
    const [result] = await (this.db as any).select().from(users).where(eq(users.email, email));
    return result || null;
  }

  async findByPhone(phone: string) {
    const [result] = await (this.db as any).select().from(users).where(eq(users.phone, phone));
    return result || null;
  }
}

export const usersRepository = new UsersRepository();
