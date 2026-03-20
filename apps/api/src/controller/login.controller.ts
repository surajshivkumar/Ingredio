import { FastifyReply, FastifyRequest } from "fastify";
import { LoginService } from "../services/login.service";
import { BadRequestError } from "../errors";

const loginService = new LoginService();

export async function login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    if (!email) {
        throw new BadRequestError("Email is required");
    }
    if (!password) {
        throw new BadRequestError("Password is required");
    }

    const result = await loginService.authenticateUser(email, password);
    return reply.status(200).send(result);
}
