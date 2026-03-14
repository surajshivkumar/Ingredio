import { FastifyInstance } from "fastify";
import { login } from "../controller/login.controller";

export default async function loginRoutes(fastify: FastifyInstance) {
    // POST /api/v1/login
    fastify.post("/", login);
}