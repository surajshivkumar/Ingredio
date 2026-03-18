import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    async getItemsByCategory(request: FastifyRequest, reply: FastifyReply) {
        const { categoryId } = request.params as { categoryId: string };
        try {
            const items = await this.productService.getItemsByCategory(categoryId);
            if (!items || items.length === 0) {
                return reply.status(404).send({ message: "Category not found" });
            }
            return reply.status(200).send(items);
        } catch (err: any) {
            return reply.status(500).send({ message: err.message || "Internal server error" });
        }
    }

    async getItemById(request: FastifyRequest, reply: FastifyReply) {
        const { categoryId, itemId } = request.params as { categoryId: string; itemId: string };
        try {
            const item = await this.productService.getItemById(categoryId, itemId);
            if (!item) {
                return reply.status(404).send({ message: "Item not found" });
            }
            return reply.status(200).send(item);
        } catch (err: any) {
            return reply.status(500).send({ message: err.message || "Internal server error" });
        }
    }
}
