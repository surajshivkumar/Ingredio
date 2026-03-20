import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../models/schema";
import { NotFoundError, AuthenticationFailedError } from "../errors";

export class LoginService {
    async authenticateUser(email: string, password: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw new NotFoundError("User");
        }

        const isPasswordValid = user.password_hash === password;
        if (!isPasswordValid) {
            throw new AuthenticationFailedError();
        }

        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
}
