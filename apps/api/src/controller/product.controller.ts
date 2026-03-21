import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";
import { NotFoundError } from "../errors";
import { CategoryParamsSchema, ItemParamsSchema } from "../schemas/product.schemas";
import { z } from "zod";

type CategoryParams = z.infer<typeof CategoryParamsSchema>;
type ItemParams = z.infer<typeof ItemParamsSchema>;

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    async getCategories(_request: FastifyRequest, reply: FastifyReply) {
        const categories = await this.productService.getCategories();
        return reply.status(200).send(categories);
    }

    async getItemsByCategory(
        request: FastifyRequest<{ Params: CategoryParams }>,
        reply: FastifyReply
    ) {
        const { categoryId } = request.params;
        const items = await this.productService.getItemsByCategory(categoryId);
        if (!items || items.length === 0) {
            throw new NotFoundError("Category");
        }
        return reply.status(200).send(items);
    }

    async getItemById(
        request: FastifyRequest<{ Params: ItemParams }>,
        reply: FastifyReply
    ) {
        const { categoryId, itemId } = request.params;
        const item = await this.productService.getItemById(categoryId, itemId);
        if (!item) {
            throw new NotFoundError("Item");
        }
        return reply.status(200).send(item);
    }
}
