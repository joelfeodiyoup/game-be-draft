import { createGameRatingRepository } from "@/repositories/game-rating.repository";
import { disallowInProduction } from "@/utils/environment-guards";
import { GameRatingValue } from "./game-rating.schema";
import { createGamesRepository } from "@/repositories/games.repository";
import prisma from "@/databases/postgres/db";

export async function rateGame(args: {
  playerId: string;
  gameId: string;
  rating: GameRatingValue;
}) {
  return await prisma.$transaction(async (tx) => {
    const gameRatingRepository = createGameRatingRepository(tx);
    const updatedRating = await gameRatingRepository.upsertRating({
      data: {
        create: {
          player: { connect: { id: args.playerId } },
          rating: args.rating,
          game: { connect: { id: args.gameId } },
        },
        update: { rating: args.rating },
      },
      playerAndGameId: {
        player_id_game_id: {
          player_id: args.playerId,
          game_id: args.gameId,
        },
      },
    });

    const aggregates = await gameRatingRepository.aggregateRatings({
      where: { game_id: args.gameId },
    });

    const gamesRepository = createGamesRepository(tx);

    const game = await gamesRepository.updateGame({
      data: {
        average_rating: aggregates._avg.rating,
        rating_count: aggregates._count,
      },
      where: { id: args.gameId },
    });

    return updatedRating;
  });
}

export async function getGameRatings({ gameId }: { gameId: string }) {
    return prisma.$transaction(async tx => {
        return createGameRatingRepository(tx).getRatingsForGame({
            gameId: { game_id: gameId },
        });
    })
}

export async function deletePlayerGameRating(args: {
  playerId: string;
  gameId: string;
}) {
    return prisma.$transaction(async tx => {
        return createGameRatingRepository(tx).deleteRating({
            playerAndGameId: {
                player_id_game_id: {
                    player_id: args.playerId,
                    game_id: args.gameId,
                },
            },
        });
    })
}

export async function deleteAllGameRatings() {
  disallowInProduction();
  return prisma.$transaction(async tx => {
      return createGameRatingRepository(tx).deleteAll();
    })
}
