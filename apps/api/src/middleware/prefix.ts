import { FastifyInstance } from "fastify";
import productRoutes from "../routes/products";
import recommendRoutes from "../routes/recommend";
import loginRoutes from "../routes/login";
import requestContext from "./request.context";

export default async function prefix(app: FastifyInstance) {
    app.register(async (v1) => {
        
        // 1. Global middleware for this v1 scope
        await v1.register(requestContext);

        // 2. Register feature routes under /api/v1
        v1.register(productRoutes, { prefix: "/products" });
        v1.register(recommendRoutes, { prefix: "/recommendations" });
        v1.register(loginRoutes, { prefix: "/login" });
        
        v1.get("/", async () => {
            return { message: "Ingredio API v1" };
        });
    }, { prefix: "/api/v1" });
}
    