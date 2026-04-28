import { createGamesRepository } from "@/repositories/games.repository";
import { Worker } from "common/transaction.types"
import { Game } from "types"

type GameWorkers = {
    getGameById: Worker<{id: string}, Game | null>;
    getGames: Worker<void, Game[]>;
}

export const gameWorkers: GameWorkers = {
    getGameById: async (tx, {id}) => {
        return createGamesRepository(tx).getById({whereGame: {id}});
    },
    getGames: async (tx) => {
        return await createGamesRepository(tx).getAll();
    }
}