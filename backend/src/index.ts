import { Hono } from "hono";
import { cors } from 'hono/cors';
import { authRouter } from "./domains/auth/auth.controller";
import { serve } from "@hono/node-server";
import { connectMongo } from './databases/mongodb/db';
import { gamesRouter } from "./domains/games/games.controller";
import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "./domains/domains.types";
import { Scalar } from "@scalar/hono-api-reference";
import { RouteTag } from "common/route-helpers";
import { app } from "routes";

async function main() {
    await connectMongo();

    const port = 3000;
    console.log(`Server running on http://localhost:${port}`);
    
    serve({
        fetch: app.fetch,
        port
    });
}

main();