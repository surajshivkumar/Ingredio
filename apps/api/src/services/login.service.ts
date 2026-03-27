import bcrypt from "bcrypt";
import { usersRepository } from "../repositories";
import { NotFoundError, AuthenticationFailedError } from "../errors";

export class LoginService {
    async authenticateUser(email: string, password: string) {
        const user = await usersRepository.findByEmail(email);

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
