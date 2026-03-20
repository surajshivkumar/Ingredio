import { FastifyInstance } from "fastify";
import { AppError } from "../errors";

export default async function errorHandler(app: FastifyInstance) {
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                code: error.code,
                message: error.message,
            });
        }

        request.log.error(error);

        return reply.status(500).send({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
        });
    });
}
