import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
    static async getItemsByCategory(request: FastifyRequest, reply: FastifyReply) {
        const { categoryId } = request.params as { categoryId: string };
        try {
            const items = await productService.getItemsByCategory(categoryId);
            return reply.status(200).send(items);
        } catch (err: any) {
            return reply.status(500).send({ message: err.message || "Internal server error" });
        }
    }

    static async getItemById(request: FastifyRequest, reply: FastifyReply) {
        const { categoryId, itemId } = request.params as { categoryId: string; itemId: string };
        try {
            const item = await productService.getItemById(categoryId, itemId);
            if (!item) {
                return reply.status(404).send({ message: "Item not found" });
            }
            return reply.status(200).send(item);
        } catch (err: any) {
            return reply.status(500).send({ message: err.message || "Internal server error" });
        }
    }
}
