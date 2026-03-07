import { FastifyInstance } from "fastify";
import { ProductRecommendationController } from "../controller/product.recommendation.controller";

export default async function recommendRoutes(fastify: FastifyInstance) {
    // GET /api/v1/recommendations
    fastify.get("/", ProductRecommendationController.getRecommendations);
}
