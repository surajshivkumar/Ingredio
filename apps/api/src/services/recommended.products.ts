import { Product } from "../types/product";
import { productRecommendation } from "../types/product.recommendation";

export class RecommendedProductsService {
    /**
     * Fetch product recommendations for a specific user.
     * In a real implementation, this would query Postgres or a Recommendation Engine.
     */
    async getRecommendationsForUser(userId: string): Promise<productRecommendation> {
        // Simulate a database/network delay
        await new Promise(resolve => setTimeout(resolve, 50));

        const mockProducts: Product[] = [
            {
                id: "prod_1",
                name: "Healthy Oat Biscuits",
                barcode: "8901234567890",
                safetyScore: "A",
                ingredients: ["Oats", "Honey", "Almond Flour"]
            },
            {
                id: "prod_2",
                name: "Organic Green Tea",
                barcode: "8909876543210",
                safetyScore: "A+",
                ingredients: ["Green Tea Leaves"]
            }
        ];
        
        return {
            recommendedProducts: mockProducts
        };
    }
}