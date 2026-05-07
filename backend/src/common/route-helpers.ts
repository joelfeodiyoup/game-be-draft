import { createRoute, RouteConfig } from "@hono/zod-openapi"

export const createTaggedRoute = (...tag: RouteTag[]) => {
    return <T extends RouteConfig>(config: T) => createRoute({
        ...config,
        tags: tag
    } as typeof config & { tags: [string] });
};

export enum RouteTag {
    "Games" = 'Games',
    "Auth" = "Authentication",
    "GameRating" = "Game Rating",
    "Dev" = "Dev",
};