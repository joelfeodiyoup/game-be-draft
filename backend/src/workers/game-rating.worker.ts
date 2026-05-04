import { AggregateGameRatingsInput, CreateGameRatingInput, DeleteGameRatingInput } from "@/domains/games/game-rating.schema";
import { createGameRatingRepository } from "@/repositories/game-rating.repository";
import { disallowInProduction } from "@/utils/environment-guards";
import { GameRating, Prisma } from "@prisma/client";
import { Worker } from "common/transaction.types";

type AggregateResult = Awaited<ReturnType<ReturnType<typeof createGameRatingRepository>['aggregateRatings']>>;
type GameRatingWorkers = {
    create: Worker<CreateGameRatingInput, GameRating>,
    get: Worker<AggregateGameRatingsInput, GameRating[]>,
    delete: Worker<DeleteGameRatingInput, GameRating>,
    deleteAll: Worker<void, void>,
    aggregateRatings: Worker<AggregateGameRatingsInput, AggregateResult>,
    // aggregateRatings: Worker<AggregateGameRatingsInput, Prisma.GameRatingAggregateArgs>,
}
export const gameRatingWorkers: GameRatingWorkers = {
    create: async (tx, args) => {
        const updatedRating = await createGameRatingRepository(tx).upsertRating({
            data: {
              create: {
                player: { connect: { id: args.playerId } },
                rating: args.rating,
                comment: args.comment,
                game: { connect: { id: args.gameId } },
              },
              update: { rating: args.rating, comment: args.comment },
            },
            playerAndGameId: {
              player_id_game_id: {
                player_id: args.playerId,
                game_id: args.gameId,
              },
            },
          });

        return updatedRating;
    },
    get: async (tx, args) => {
        return await createGameRatingRepository(tx).getRatingsForGame({gameId: { game_id: args.gameId}});
    },
    delete: async (tx, args) => {
        return await createGameRatingRepository(tx).deleteRating({
            playerAndGameId: {
                player_id_game_id: {
                    player_id: args.playerId,
                    game_id: args.gameId,
                },
            },
        })
    },
    deleteAll: async (tx, args) => {
        disallowInProduction(); 
        await createGameRatingRepository(tx).deleteAll();
    },
    aggregateRatings: async (tx, args) => {
        return await createGameRatingRepository(tx).aggregateRatings({
            where: { game_id: args.gameId },
          });
    }
}