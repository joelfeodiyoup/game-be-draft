import { Hono } from "hono";
import { cors } from 'hono/cors';
import { authRouter } from "./domains/auth/auth.controller";
import { serve } from "@hono/node-server";

const app = new Hono();

app.use('/*', cors({
    origin: ['http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
}))

app.route('/auth', authRouter);

app.get('/', (c) => c.text('Game API running'));

const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port
});