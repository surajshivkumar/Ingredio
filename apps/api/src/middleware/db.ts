import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { db } from "../db";
import { pool } from "../db";
import * as repositories from "../repositories";

declare module "fastify" {
    interface FastifyInstance {
        db: typeof db;
        repositories: typeof repositories;
    }
}

export default fp(async function dbPlugin(fastify: FastifyInstance) {
    // Decorate fastify with the Drizzle db instance
    fastify.decorate("db", db);

    // Decorate fastify with all repositories
    fastify.decorate("repositories", repositories);

    // Gracefully close the pool on shutdown
    fastify.addHook("onClose", async () => {
        await pool.end();
        fastify.log.info("Database pool closed");
    });

    fastify.log.info("Database connected");
});
