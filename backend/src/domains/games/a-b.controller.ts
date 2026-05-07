import { OpenAPIHono, z } from "@hono/zod-openapi";
import { AppEnv } from "../domains.types";
import { createTaggedRoute, RouteTag } from "common/route-helpers";
import { createResponseType } from "common/api-responses";
import { prismaTransaction } from "@/databases/postgres/db";
import { createGamesRepository } from "@/repositories/games.repository";

export const abRouter = new OpenAPIHono<AppEnv>();

const testFunction = async ({value = 'a'}: {value: 'a' | 'b'}) => {
    const result = await prismaTransaction(async tx => {
        return await createGamesRepository(tx).getAll(value === 'b');
    });
    return result;
}

abRouter.openapi(
    createTaggedRoute(RouteTag.Dev)({
        method: 'get',
        path: '/test',
        description: 'a/b test',
        request: {
            query: z.object({
                isB: z.string().optional().transform(val => {
                    if (val === undefined) return undefined;
                    return val === '1' || val === 'true';
                }),
            })
        },
        responses: {
            200: createResponseType({schema: z.object()}),
        }
    }),
    async c => {
        const { isB } = c.req.valid('query');
        const result = await testFunction({value: isB ? 'b' : 'a'});

        return c.json(result);
    }
)