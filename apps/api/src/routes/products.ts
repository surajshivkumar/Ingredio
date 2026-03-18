import { FastifyInstance } from "fastify";
import { ProductController } from "../controller/product.controller";

export default async function productRoutes(fastify: FastifyInstance) {
    const controller = new ProductController();

    fastify.get("/category/:categoryId/items", controller.getItemsByCategory.bind(controller));
    fastify.get("/category/:categoryId/items/:itemId", controller.getItemById.bind(controller));

    // GET /api/v1/products/:barcode
    fastify.get("/:barcode", async (request, reply) => {
        const { barcode } = request.params as { barcode: string };
        
        // Placeholder logic: You would look up this barcode in Postgres/Redis here.
        return reply.status(200).send({
            barcode,
            name: "Sample Product",
            safetyScore: "A",
            ingredients: ["Water", "Sugar"]
        });
    });

    // POST /api/v1/products/scan
    fastify.post("/scan", async (_request, reply) => {
        // Placeholder for OCR logic
        return reply.status(200).send({
            message: "OCR processing started"
        });
    });
}
