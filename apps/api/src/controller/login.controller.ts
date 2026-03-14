import { FastifyReply, FastifyRequest } from "fastify";
import { LoginService } from "../services/login.service";

const loginService = new LoginService();

export async function login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    if (!email) {
        return reply.status(400).send({ message: "Email is required" });
    }
    if (!password) {
        return reply.status(400).send({ message: "Password is required" });
    }

    try {
        const result = await loginService.authenticateUser(email, password);
        return reply.status(200).send(result);
    } catch (err: any) {
        return reply.status(err.statusCode || 500).send({ message: err.message || "Internal server error" });
    }
}