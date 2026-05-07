import { gamesOrchestrators } from "./game-catalog.orchestrator";
import { gameSessionOrchestrators } from "./game-session.orchestrator";
import { requireAuth, requireRole } from "middleware/auth.middleware";
import { withPlayer } from "middleware/with-player.middleware";

import { z } from "zod";
import { AppEnv } from "../domains.types";

import { OpenAPIHono } from "@hono/zod-openapi";
import { commonResponses, createResponseType } from "common/api-responses";
import { createTaggedRoute, RouteTag } from "common/route-helpers";
import { gameRatingsRouter } from "./game-rating.controller";
import { gameBaseSchema, gameDetailSchema } from "./games.schema";
import { traceOperation } from "common/tracing-helpers";

export const gamesRouter = new OpenAPIHono<AppEnv>();

gamesRouter.route('/:gameId/ratings', gameRatingsRouter);

const createGamesRoute = createTaggedRoute(RouteTag.Games);

gamesRouter.openapi(
    createGamesRoute({
      method: "get",
      path: "/",
      description: 'list all games',
      responses: {
        ...commonResponses,
        200: createResponseType({
          schema: z.array(gameBaseSchema),
        }),
      },
    }),
    async (c) => traceOperation('games.controller.getAll', async () => {
      const result = await gamesOrchestrators.getAll();
  
      return c.json(result, 200);
    })
  );

gamesRouter.openapi(
  createGamesRoute({
    method: 'get',
    path: '/{gameId}',
    description: 'get details for a game',
    request: {
      params: z.object({ gameId: z.string()})
    },
    responses: {
      200: createResponseType({ schema: gameDetailSchema})
    }
  }),
  async c => {
    const { gameId } = c.req.valid('param');

    const game = await gamesOrchestrators.get({gameId});

    return c.json(gameDetailSchema.parse(game), 200);
  }
)

gamesRouter.openapi(
  createGamesRoute({
    method: "get",
    path: "/{gameId}/scenarios",
    description: 'get all scenarios for a game',
    request: {
        params: z.object({ gameId: z.string() })
    },
    responses: {
        200: createResponseType({ schema: z.array(
          z.object({ id: z.string()})
        )})
    }
  }),
  async (c) => {
    const { gameId } = c.req.valid('param');

    const scenarios = await gamesOrchestrators.getScenarios({ gameId });
    return c.json(scenarios ?? []);
  }
);

gamesRouter.openapi(
  createGamesRoute({
    path: "/{gameId}/scenarios/{scenarioId}/start-new",
    method: 'post',
    description: 'start playing a scenario',
    request: {
      params: z.object({
        scenarioId: z.string(),
        gameId: z.string(),
      })
    },
    responses: {
      200: createResponseType({
        schema: z.object({})
      }),
    },
    middleware: [
      requireAuth,
      withPlayer,
    ]
  }),
  async c => {
    const {scenarioId} = c.req.valid('param');
    const sessionId = c.get("sessionId");

    const newGame = await gameSessionOrchestrators.startNewGame({ scenarioId, sessionId });
    return c.json(newGame);
  }
);

gamesRouter.openapi(
  createGamesRoute({
    method: 'post',
    path: "/{gameId}/scenarios",
    description: 'create a new scenario (requires admin role)',
    request: {
      params: z.object({
        gameId: z.string()
      })
    },
    security: [{ cookieAuth: ['ADMIN']}],
    responses: {
      200: createResponseType({
        schema: z.object({}),
      })
    },
    middleware: [
      requireAuth,
      requireRole("ADMIN"),
    ]
  }),
  async c => {
    // just a mock implementation for now.
    // it just demonstrates that the route is allowed by certain roles.
    return c.json("scenario created");
  }
)