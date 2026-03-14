import { FastifyInstance } from "fastify";

// Augment the FastifyRequest type so `.subPath` is available everywhere
declare module "fastify" {
    interface FastifyRequest {
        subPath: string;
    }
}

export default async function requestContext(app: FastifyInstance) {
    // Register the decorator with a default value (required by Fastify)
    app.decorateRequest("subPath", "");

    app.addHook(
        "onRequest",
        async (request, reply) => {
            // Strip /api/v1 prefix so handlers only see what comes after it
            const PREFIX = "/api/v1";
            const fullPath = request.url.split("?")[0]; // ignore query string
            request.subPath = fullPath.startsWith(PREFIX)
                ? fullPath.slice(PREFIX.length) || "/"
                : fullPath;

            const userId = request.headers["x-user-id"];

            if (!userId) {
                await reply.status(401).send({ message: "Unauthorized: x-user-id header missing" });
                return;
            }
        }
    );
}