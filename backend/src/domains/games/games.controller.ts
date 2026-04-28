import { getGames, getScenarios } from "./game-catalog.orchestrator";
import { gameSessionOrchestrators } from "./game-session.orchestrator";
import { requireAuth, requireRole } from "middleware/auth.middleware";
import { withPlayer } from "middleware/with-player.middleware";

import { z } from "zod";
import { AppEnv } from "../domains.types";

import { OpenAPIHono } from "@hono/zod-openapi";
import { gameSchema } from "./games-api.schemas";
import { commonResponses, createResponseType } from "common/api-responses";
import { createTaggedRoute, RouteTag } from "common/route-helpers";
import { gameRatingsRouter } from "./game-rating.controller";

export const gamesRouter = new OpenAPIHono<AppEnv>();

gamesRouter.route('/:gameId', gameRatingsRouter);

const createGamesRoute = createTaggedRoute(RouteTag.Games);

gamesRouter.openapi(
    createGamesRoute({
      method: "get",
      path: "/",
      description: 'list all games',
      responses: {
        ...commonResponses,
        200: createResponseType({
          schema: z.array(gameSchema),
        }),
      },
    }),
    async (c) => {
      const result = await getGames();
  
      return c.json(result, 200);
    }
  );

gamesRouter.openapi(
  createGamesRoute({
    method: "get",
    path: "/:gameId/scenarios",
    description: 'get all scenarios for a game',
    request: {
        params: z.object({ gameId: z.string() })
    },
    responses: {
        200: createResponseType({ schema: z.object({ id: z.string()})})
    }
  }),
  async (c) => {
    const { gameId } = c.req.valid('param');

    const scenarios = await getScenarios({ gameId });
    return c.json(scenarios ?? []);
  }
);

gamesRouter.post(
  "/:gameId/scenarios/:scenarioId/start-new",
  requireAuth,
  withPlayer,
  async (c) => {
    const scenarioId = c.req.param("scenarioId");
    const sessionId = c.get("sessionId");

    const newGame = await gameSessionOrchestrators.startNewGame({ scenarioId, sessionId });
    return c.json(newGame);
  }
);


gamesRouter.post(
  "/:gameId/scenarios",
  requireAuth,
  requireRole("ADMIN"),
  async (c) => {
    return c.json("scenario created");
  }
);
