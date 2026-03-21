
import Fastify from "fastify";
import cors from "@fastify/cors";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import prefix from "./middleware/prefix";
import logger from "./middleware/logger";
import requestContext from "./middleware/request.context";
import dbPlugin from "./middleware/db";
import errorHandler from "./middleware/error.handler";

const port = parseInt(process.env.PORT || '9600');

const app = Fastify({
    logger: logger
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"]
});

app.register(prefix);
app.register(requestContext);
app.register(dbPlugin);
app.register(errorHandler);

// Root health check
app.get("/health", async (request, reply) => {
    return reply.status(200).send({ status: "running" })
});
// Register the v1 prefix routes (this will add /api/v1 prefix)


const start = async () => {
    try {
        await app.listen({ port, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();