import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "../domains.types";
import { gameRatingResponseSchema, gameRatingSchema } from "./game-rating.schema";
import { createTaggedRoute, RouteTag } from "common/route-helpers";
import { z } from 'zod';
import { createResponseType } from "common/api-responses";
import { requireAuth } from "middleware/auth.middleware";
import { withPlayer } from "middleware/with-player.middleware";
import { getGameRatings, rateGame } from "./game-rating.service";
import { zValidator } from "@hono/zod-validator";

export const gameRatingsRouter = new OpenAPIHono<AppEnv>();

const createGameRatingRoute = createTaggedRoute(RouteTag.GameRating);

gameRatingsRouter.openapi(
    createGameRatingRoute({
      method: "post",
      path: "/ratings",
      request: {
        body: { content: { "application/json": { schema: gameRatingSchema } } },
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
      middleware: [
          requireAuth,
          zValidator("json", gameRatingSchema),
          withPlayer
      ],
    }),
    async (c) => {
      const { gameId } = c.req.valid("param");
      const { rating } = c.req.valid("json");
      const playerId = c.get("playerId");
      const response = await rateGame({ playerId, gameId, rating: rating });
  
      return c.json(response);
    }
  );

  gameRatingsRouter.openapi(
    createGameRatingRoute({
        method: 'get',
        path: '/',
        request: {
            params: z.object({
              gameId: z.string(),
            }),
          },
        responses: {
            200: createResponseType({
                schema: z.array(z.object({rating: z.number()}))
            })
        }
    }),
    async c => {
        const { gameId } = c.req.valid('param');
        const response = await getGameRatings({gameId});

        return c.json(response, 200);
    }
);