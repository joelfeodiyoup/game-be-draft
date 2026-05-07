import { disallowInProduction } from "@/utils/environment-guards";
import { Prisma } from "@prisma/client";
import { traceOperation } from "common/tracing-helpers";

// Define the include structure for game details - single source of truth
export const gameDetailInclude = {
  game_ratings: {
    include: {
      player: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      updated_at: "desc",
    },
  },
} satisfies Prisma.GameInclude;

export const createGamesRepository = (prisma: Prisma.TransactionClient) => ({
  async getAll(alt = false) {
    return traceOperation("games.repository.getAll", async () =>
      prisma.game.findMany({
        ...(!alt
          ? {
              orderBy: {
                title: "asc",
              },
            }
          : {}),
      })
    );
  },
  async create({ data }: { data: Prisma.GameCreateInput }) {
    return prisma.game.create({ data });
  },
  async getById({
    whereGame,
  }: {
    whereGame: Pick<Prisma.GameWhereUniqueInput, "id">;
  }) {
    return prisma.game.findUnique({
      where: whereGame,
      include: gameDetailInclude,
    });
  },
  async updateGame({
    data,
    where,
  }: {
    data: Prisma.GameUpdateInput;
    where: Pick<Prisma.GameWhereUniqueInput, "id">;
  }) {
    return prisma.game.update({ data, where });
  },
  async deleteAll() {
    disallowInProduction();
    return prisma.game.deleteMany();
  },
});
