import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { RouteTag } from "common/route-helpers";
import { cors } from "hono/cors";
import { authRouter } from "./domains/auth/auth.controller";
import { AppEnv } from "./domains/domains.types";
import { gamesRouter } from "./domains/games/games.controller";
import { tracingMiddleware } from "./middleware/tracing.middleware";
import { abRouter } from "./domains/games/a-b.controller";

export function registerApp() {
const app = new OpenAPIHono<AppEnv>();

app.use('/*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}))

// Ensure OpenTelemetry context is preserved through Hono
app.use('/*', tracingMiddleware)

app.route('/auth', authRouter);
app.route('/games', gamesRouter);
app.route('/dev', abRouter);

app.get('/', (c) => c.text('Game API running'));

const tags: { name: RouteTag, description: string}[] = [
    {name: RouteTag.Auth, description: 'Auth endpoints'},
    {name: RouteTag.Games, description: 'Game-related endpoints'},
    {name: RouteTag.GameRating, description: 'Game ratings'},
]

const docDefinition = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Game API'},
        servers: [
            { url: 'http://localhost:3000', description: 'Local server'}
        ],
        tags,
    };
let openapiSpec = app.getOpenAPI31Document(docDefinition);

app.get('/doc.json', (c) => {
    const doc = app.getOpenAPI31Document(docDefinition);
    doc.components = {
        ...doc.components,
        securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'sessionId',
                    description: 'Session ID cookie. Required roles specified per endpoint.',
                }
            }
    };

    openapiSpec = doc;

    return c.json(doc);
});

    app.get('/doc', Scalar({
        spec: { url: '/doc.json' },
    }))

    return { openapiSpec, app }
}