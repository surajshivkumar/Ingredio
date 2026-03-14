import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../models/schema";

export class LoginService {
    async authenticateUser(email: string, password: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw { statusCode: 404, message: "User not found" };
        }

        // const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        const isPasswordValid = user.password_hash === password?true:false;
        if (!isPasswordValid) {
            throw { statusCode: 401, message: "Invalid password" };
        }

        // Return user data without password_hash and sensitive info, instead of JWT
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
}
