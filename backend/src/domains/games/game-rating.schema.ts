import {z} from 'zod';

export const gameRatingValueSchema = z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
]);

export type GameRatingValue = z.infer<typeof gameRatingValueSchema>;

export const gameRatingSchema = z.object({
    rating: gameRatingValueSchema,
});

export const gameRatingResponseSchema = z.object({
    created_at: z.date(),
    game_id: z.string(),
    player_id: z.string(),
    rating: z.number(),
})