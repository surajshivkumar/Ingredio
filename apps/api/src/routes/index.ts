import { FastifyInstance } from "fastify";
import productRoutes from "./products";
import recommendRoutes from "./recommend";
import loginRoutes from "./login";

export default async function routes(app: FastifyInstance) {
    app.register(async (v1) => {
        v1.register(productRoutes, { prefix: "/products" });
        v1.register(recommendRoutes, { prefix: "/recommendations" });
        v1.register(loginRoutes, { prefix: "/login" });

        v1.get("/", async () => {
            return { message: "Ingredio API v1" };
        });

        v1.get("/health", { config: { public: true } }, async () => {
            return { status: "running" };
        });
    }, { prefix: "/api/v1" });
}
