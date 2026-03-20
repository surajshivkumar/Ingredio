import { FastifyRequest, FastifyReply } from "fastify";
import { RecommendedProductsService } from "../services/recommended.products";
import { UnauthorizedError } from "../errors";

const recommendationService = new RecommendedProductsService();

export class ProductRecommendationController {
    static async getRecommendations(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.headers["x-user-id"] as string;

        if (!userId) {
            throw new UnauthorizedError("x-user-id header missing");
        }

        const recommendations = await recommendationService.getRecommendationsForUser(userId);
        return reply.status(200).send(recommendations);
    }
}
