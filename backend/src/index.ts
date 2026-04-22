import { Hono } from "hono";
import { cors } from 'hono/cors';
import { authRouter } from "./domains/auth/auth.controller";
import { serve } from "@hono/node-server";
import { connectMongo } from './databases/mongodb/db';
import { gamesRouter } from "./domains/games/games.controller";

const app = new Hono();

app.use('/*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}))

app.route('/auth', authRouter);
app.route('/games', gamesRouter);

app.get('/', (c) => c.text('Game API running'));


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