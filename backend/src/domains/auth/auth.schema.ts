import { z } from 'zod';

export const sessionSchema = z.object({
    sessionId: z.string(),
    playerId: z.string(),
    expiresAt: z.date(),
})