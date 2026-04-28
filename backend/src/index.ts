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

//
const app = new OpenAPIHono<AppEnv>();

app.use('/*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}))

app.route('/auth', authRouter);
app.route('/games', gamesRouter);

app.get('/', (c) => c.text('Game API running'));

const tags: { name: RouteTag, description: string}[] = [
    {name: RouteTag.Auth, description: 'Auth endpoints'},
    {name: RouteTag.Games, description: 'Game-related endpoints'},
]

app.doc('/doc.json', {
    openapi: '3.1.0',
    info: { version: '1.0.0', title: 'Game API'},
    servers: [
        { url: 'http://localhost:3000', description: 'Local server'}
    ],
    tags
});

app.get('/doc', Scalar({
    spec: { url: '/doc.json' }
}))

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