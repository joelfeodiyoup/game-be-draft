import { registerTracing } from './tracing';

import { initializePrisma } from './databases/postgres/db';
import { serve } from "@hono/node-server";
import { connectMongo } from './databases/mongodb/db';
import { registerApp } from "routes";


async function main() {
    registerTracing();
    const { app } = registerApp();
    initializePrisma();
    await connectMongo();

    const port = 3000;
    console.log(`Server running on http://localhost:${port}`);

    serve({
        fetch: app.fetch,
        port
    });
}

main();