import prisma from "@/databases/postgres/db";
import { gameScenarioWorkers } from "workers/game-scenario.worker";
import { gameWorkers } from "workers/game.worker";

export async function getGames() {
    return prisma.$transaction(async tx => {
        return gameWorkers.getGames(tx);
    })
}

export async function getScenarios({gameId}: {gameId: string}) {
    return prisma.$transaction(async tx => {
        return gameScenarioWorkers.getGameScenarios(tx, {gameId});
    })
}