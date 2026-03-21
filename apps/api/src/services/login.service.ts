import bcrypt from "bcrypt";
import { usersRepository } from "../repositories";

export class LoginService {
    async authenticateUser(email: string, password: string) {
        const user = await usersRepository.findByEmail(email);

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
