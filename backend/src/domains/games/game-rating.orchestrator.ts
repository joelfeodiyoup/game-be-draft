import { disallowInProduction } from "@/utils/environment-guards";
import {
  AggregateGameRatingsInput,
  CreateGameRatingInput,
  DeleteGameRatingInput,
} from "./game-rating.schema";
import { prismaTransaction } from "@/databases/postgres/db";
import { gameRatingWorkers } from "workers/game-rating.worker";
import { Orchestrator } from "common/transaction.types";
import { GameRating } from "@prisma/client";

type GameRatingsOrchestrators = {
  rateGame: Orchestrator<CreateGameRatingInput, GameRating>;
  getGameRatings: Orchestrator<AggregateGameRatingsInput, GameRating[]>;
  deletePlayerGameRating: Orchestrator<DeleteGameRatingInput, GameRating>;
  deleteAllGameRatings: Orchestrator<void, void>;
};

export const gameRatingsOrchestrators: GameRatingsOrchestrators = {
  rateGame: async (args: CreateGameRatingInput) => {
    return await prismaTransaction(async (tx) => {
      const gameRating = await gameRatingWorkers.create(tx, args);

      const aggregates = await gameRatingWorkers.aggregateRatings(tx, args);

      // const game = await gamesRepository.updateGame({
      //   data: {
      //     average_rating: aggregates._avg.rating,
      //     rating_count: aggregates._count,
      //   },
      //   where: { id: args.gameId },
      // });

      return gameRating;
    });
  },

  getGameRatings: async (args: AggregateGameRatingsInput) => {
    return prismaTransaction(async (tx) => {
      return gameRatingWorkers.get(tx, args);
    });
  },

  deletePlayerGameRating: async (args: DeleteGameRatingInput) => {
    return prismaTransaction(async (tx) => {
      return gameRatingWorkers.delete(tx, args);
    });
  },

  deleteAllGameRatings: async () => {
    disallowInProduction();
    return prismaTransaction(async (tx) => {
      return gameRatingWorkers.deleteAll(tx);
    });
  },
};
