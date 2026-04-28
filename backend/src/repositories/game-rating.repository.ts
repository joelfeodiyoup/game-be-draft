import { Prisma } from "@prisma/client";
import { disallowInProduction } from "@/utils/environment-guards";

export const createGameRatingRepository = (
  prisma: Prisma.TransactionClient
) => ({
  async getRatingsForGame({
    gameId,
  }: {
    gameId: Pick<Prisma.GameRatingWhereInput, "game_id">;
  }) {
    return prisma.gameRating.findMany({ where: gameId });
  },
  async upsertRating({
    data,
    playerAndGameId,
  }: {
    data: {
      update: Prisma.GameRatingUpdateInput;
      create: Prisma.GameRatingCreateInput;
    };
    playerAndGameId: Pick<
      Prisma.GameRatingWhereUniqueInput,
      "player_id_game_id"
    >;
  }) {
    return prisma.gameRating.upsert({
      where: playerAndGameId,
      create: data.create,
      update: data.update,
    });
  },
  async aggregateRatings({ where }: {where: Prisma.GameRatingWhereInput}) {
    return await prisma.gameRating.aggregate({where, _avg: { rating: true}, _count: true});
  },
  async deleteRating({
    playerAndGameId,
  }: {
    playerAndGameId: Pick<
      Prisma.GameRatingWhereUniqueInput,
      "player_id_game_id"
    >;
  }) {
    return prisma.gameRating.delete({ where: playerAndGameId });
  },
  async deleteAll() {
    disallowInProduction();
    return prisma.gameRating.deleteMany();
  },
});