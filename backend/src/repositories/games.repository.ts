import { disallowInProduction } from "@/utils/environment-guards";
import { Prisma } from "@prisma/client"

// Define the include structure for game details - single source of truth
export const gameDetailInclude = {
    game_ratings: {
        include: {
            player: {
                select: {
                    id: true,
                    username: true,
                }
            }
        }
    }
} satisfies Prisma.GameInclude;

export const createGamesRepository = (prisma: Prisma.TransactionClient) => ({
    async getAll() {
        return prisma.game.findMany();
    },
    async getById({whereGame}: {whereGame: Pick<Prisma.GameWhereUniqueInput, 'id'>}) {
        return prisma.game.findUnique({where: whereGame, include: gameDetailInclude});
    },
    async updateGame({ data, where}: { data: Prisma.GameUpdateInput, where: Pick<Prisma.GameWhereUniqueInput, 'id'>}) {
        return prisma.game.update({data, where});
    },
    async deleteAll() {
        disallowInProduction();
        return prisma.game.deleteMany();
    }
})