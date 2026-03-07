import { FastifyInstance } from "fastify";

export default async function requestContext(app: FastifyInstance) {
    app.addHook(
        "onRequest",
        async (request, reply) => {
            const userId = request.headers["x-user-id"];
            
            // For now, let's just make it a mock pass-through if missing, 
            // or enforce it based on the route. Let's enforce it since it's an example.
            if (!userId) {
                await reply.status(401).send({ message: "Unauthorized: x-user-id header missing" });
                return;
            }
        }
    );
}