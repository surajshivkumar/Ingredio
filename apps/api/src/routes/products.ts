import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ProductController } from "../controller/product.controller";
import { CategoryParamsSchema, ItemParamsSchema } from "../schemas/product.schemas";

export default async function productRoutes(fastify: FastifyInstance) {
    const controller = new ProductController();
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get(
        "/category/:categoryId/items",
        { schema: { params: CategoryParamsSchema } },
        controller.getItemsByCategory.bind(controller)
    );

    app.get(
        "/category/:categoryId/items/:itemId",
        { schema: { params: ItemParamsSchema } },
        controller.getItemById.bind(controller)
    );

    app.get("/categories", controller.getCategories.bind(controller));

    // GET /api/v1/products/:barcode
    app.get("/:barcode", async (request, reply) => {
            const { barcode } = request.params as { barcode: string };

            // Placeholder logic: You would look up this barcode in Postgres/Redis here.
            return reply.status(200).send({
                barcode,
                name: "Sample Product",
                safetyScore: "A",
                ingredients: ["Water", "Sugar"]
            });
        }
    );

    // POST /api/v1/products/scan
    app.post("/scan", async (_request, reply) => {
        // Placeholder for OCR logic
        return reply.status(200).send({
            message: "OCR processing started"
        });
    });
}
