import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "../domains.types";
import {
  createGameRatingInputSchema,
  gameRatingResponseSchema,
  gameRatingSchema,
} from "./game-rating.schema";
import { createTaggedRoute, RouteTag } from "common/route-helpers";
import { z } from "zod";
import { createResponseType } from "common/api-responses";
import { requireAuth } from "middleware/auth.middleware";
import { withPlayer } from "middleware/with-player.middleware";
import { zValidator } from "@hono/zod-validator";
import { gameRatingsOrchestrators } from "./game-rating.orchestrator";

export const gameRatingsRouter = new OpenAPIHono<AppEnv>();

const createGameRatingRoute = createTaggedRoute(RouteTag.GameRating);

gameRatingsRouter.openapi(
  createGameRatingRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": { schema: gameRatingSchema },
        },
      },
      params: z.object({
        gameId: z.string(),
      }),
    },
    responses: {
      201: createResponseType({
        schema: gameRatingResponseSchema,
        // schema: z.object({})
      }),
    },
    middleware: [requireAuth, zValidator("json", gameRatingSchema), withPlayer],
  }),
  async (c) => {
    const { gameId } = c.req.valid("param");
    const body = c.req.valid("json");
    const playerId = c.get("playerId");
    const response = await gameRatingsOrchestrators.rateGame({
      ...body,
      playerId,
      gameId,
    });

    return c.json(response);
  }
);

gameRatingsRouter.openapi(
  createGameRatingRoute({
    method: "get",
    path: "/",
    request: {
      params: z.object({
        gameId: z.string(),
      }),
    },
    responses: {
      200: createResponseType({
        schema: z.array(z.object({ rating: z.number() })),
      }),
    },
  }),
  async (c) => {
    const { gameId } = c.req.valid("param");
    const response = await gameRatingsOrchestrators.getGameRatings({ gameId });

    return c.json(response, 200);
  }
);