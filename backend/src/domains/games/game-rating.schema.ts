import {z, ZodNumber} from 'zod';

// export const gameRatingValueSchema = z.union([
//     z.literal(1),
//     z.literal(2),
//     z.literal(3),
//     z.literal(4),
//     z.literal(5),
// ]);

// export type GameRatingValue = z.infer<typeof gameRatingValueSchema>;
export type GameRatingValue = ZodNumber;

export const gameRatingSchema = z.object({
    rating: z.number(),
    comment: z.string().optional(),
});

export const gameRatingIdentifierSchema = z.object({
    playerId: z.string(),
    gameId: z.string(),
})

export const createGameRatingInputSchema = gameRatingSchema.extend(
    gameRatingIdentifierSchema.shape
)

export type CreateGameRatingInput = z.infer<typeof createGameRatingInputSchema>;
export type DeleteGameRatingInput = z.infer<typeof gameRatingIdentifierSchema>;

export const aggregateRatingsInputSchema = gameRatingIdentifierSchema.pick({ gameId: true });
export type AggregateGameRatingsInput = z.infer<typeof aggregateRatingsInputSchema>

export const gameRatingResponseSchema = z.object({
    created_at: z.date(),
    game_id: z.string(),
    player_id: z.string(),
    rating: z.number(),
    comment: z.string().optional(),
})