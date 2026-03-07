import { FastifyRequest, FastifyReply } from "fastify";
import { RecommendedProductsService } from "../services/recommended.products";

// Instantiate the service. In a larger app, you might use Dependency Injection 
// like fastify-awilix to manage instances.
const recommendationService = new RecommendedProductsService();

export class ProductRecommendationController {
    static async getRecommendations(request: FastifyRequest, reply: FastifyReply) {
        // Extract the userId from headers (validated by requestContext middleware)
        const userId = request.headers["x-user-id"] as string;
        
        if (!userId) {
            return reply.status(401).send({ message: "User ID is required" });
        }

        try {
            const recommendations = await recommendationService.getRecommendationsForUser(userId);
            return reply.status(200).send(recommendations);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: "Failed to fetch recommendations" });
        }
    }
}