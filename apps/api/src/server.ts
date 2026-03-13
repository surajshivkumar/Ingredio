
import Fastify from "fastify";
import prefix from "./middleware/prefix";
import logger from "./middleware/logger";
import requestContext from "./middleware/request.context";
import dbPlugin from "./middleware/db";

const port = parseInt(process.env.PORT || '9100');

const app = Fastify({
    logger: logger
});
app.register(prefix);
app.register(requestContext);
app.register(dbPlugin);

// Root health check
app.get("/health", async (request, reply) => {
    return reply.status(200).send({ status: "running" })
});
app.post("/recommend", async (request, reply) => {
    return reply.status(200).send({ message: "Recommend API v1" });
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