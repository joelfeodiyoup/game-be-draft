import { Prisma } from "@prisma/client";
import prisma from "@/databases/postgres/db";

export const gameSessionRepository = {
    async create({data}: {data: Prisma.GameSessionCreateInput}) {
        return prisma.gameSession.create({data})
    }
}