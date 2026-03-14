import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { db } from "../db";
import { pool } from "../db";

declare module "fastify" {
    interface FastifyInstance {
        db: typeof db;
    }
}

export default fp(async function dbPlugin(fastify: FastifyInstance) {
    // Decorate fastify with the Drizzle db instance
    fastify.decorate("db", db);

    // Gracefully close the pool on shutdown
    fastify.addHook("onClose", async () => {
        await pool.end();
        fastify.log.info("Database pool closed");
    });

    fastify.log.info("Database connected");
});
