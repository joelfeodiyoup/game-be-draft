import { prismaTransaction } from "@/databases/postgres/db";
import { traceOperation } from "common/tracing-helpers";
import { Orchestrator } from "common/transaction.types";
import { Game, Scenario } from "types";
import { gameScenarioWorkers } from "workers/game-scenario.worker";
import { gameWorkers } from "workers/game.worker";

type GamesOrchestrators = {
    getAll: Orchestrator<void, Game[]>;
    getScenarios: Orchestrator<{gameId: string}, Scenario[]>;
    get: Orchestrator<{gameId: string}, Game | null>;
}

export const gamesOrchestrators: GamesOrchestrators = {
    getAll: async () => {
        return traceOperation('games.orchestrator.getAll', async () => {
            return prismaTransaction(async tx => {
                return await gameWorkers.getAll(tx);
            });
        });
    },
    get: async args => {
        return prismaTransaction(async tx => {
            return gameWorkers.getGameById(tx, args);
        })
    },
    getScenarios: async (args) => {
        return prismaTransaction(async tx => {
            return gameScenarioWorkers.getGameScenarios(tx, args);
        })
    }
}
