import { Prisma } from "@prisma/client"
import prisma from '../../../databases/postgres/db';

export const gamesRepository = {
    async getAll() {
        return prisma.game.findMany();
    },
    async getById({whereGame}: {whereGame: Pick<Prisma.GameWhereInput, 'id'>}) {
        return prisma.game.findFirst({where: whereGame});
    }
}