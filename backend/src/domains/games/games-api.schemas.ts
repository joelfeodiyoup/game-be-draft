import { z } from 'zod';
export const gameSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    created_at: z.date(),
})

export const gamesListResponseSchema = z.array(gameSchema);