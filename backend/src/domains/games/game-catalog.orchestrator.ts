import prisma from "@/databases/postgres/db";
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
        return prisma.$transaction(async tx => {
            return gameWorkers.getGames(tx);
        });
    },
    get: async args => {
        return prisma.$transaction(async tx => {
            return gameWorkers.getGameById(tx, args);
        })
    },
    getScenarios: async (args) => {
        return prisma.$transaction(async tx => {
            return gameScenarioWorkers.getGameScenarios(tx, args);
        })
    }
}
