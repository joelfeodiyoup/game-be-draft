import { createGamesRepository } from "@/repositories/games.repository";
import { traceOperation } from "common/tracing-helpers";
import { Worker } from "common/transaction.types";
import { Game } from "types";

type GameWorkers = {
  getGameById: Worker<{ gameId: string }, Game | null>;
  getAll: Worker<void, Game[]>;
  // updateGame: Worker<void, Game>;
};

export const gameWorkers: GameWorkers = {
  getGameById: async (tx, { gameId }) => {
    return createGamesRepository(tx).getById({ whereGame: { id: gameId } });
  },
  getAll: async (tx) =>
    traceOperation("games.worker.getAll", async () => {
      return await createGamesRepository(tx).getAll();
    }),
  // updateGame: async (tx, args) => {
  //     const updatedGame = await createGamesRepository(tx).updateGame({
  //         data: {
  //           average_rating: aggregates._avg.rating,
  //           rating_count: aggregates._count,
  //         },
  //         where: { id: args.gameId },
  //       });

  //     return updatedGame;
  // }
};
