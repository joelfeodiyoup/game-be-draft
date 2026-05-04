import { Prisma } from "@prisma/client";
import { gameDetailInclude } from "@/repositories/games.repository";
import z from "zod";

// Use Prisma's GameGetPayload to automatically infer the type from the repository's include structure
// This eliminates coupling - when you change the include, the type updates automatically
type GameDetailPayload = Prisma.GameGetPayload<{
    include: typeof gameDetailInclude
}>;

export const gameBaseSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    created_at: z.coerce.date(),
    average_rating: z.instanceof(Prisma.Decimal).transform(val => val.toNumber()).openapi({ type: 'number'}).nullable(),
    rating_count: z.number(),
})

const playerSchema = z.object({
    id: z.string(),
    username: z.string(),
}) satisfies z.ZodType<GameDetailPayload['game_ratings'][number]['player']>;

export const gameDetailSchema = gameBaseSchema.merge(
    z.object({
        game_ratings: z.array(z.object({
            player_id: z.string(),
            rating: z.number(),
            comment: z.string().nullable(),
            created_at: z.coerce.date(),
            player: playerSchema,
        })),
    })
    // TODO!!
    // @ts-ignore
) satisfies z.ZodType<GameDetailPayload>;

export type GameDetailDTO = z.infer<typeof gameDetailSchema>;

// You can also export the Prisma type if you want to use it directly in orchestrators/workers
export type { GameDetailPayload };