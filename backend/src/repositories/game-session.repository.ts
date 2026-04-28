import { Prisma } from "@prisma/client";

export const createGameSessionRepository = (prisma: Prisma.TransactionClient) => ({
    async create({data}: {data: Prisma.GameSessionCreateInput}) {
        return prisma.gameSession.create({data})
    }
})