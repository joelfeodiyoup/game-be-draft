import { prismaTransaction } from "@/databases/postgres/db";
import { GameSession } from "@prisma/client";
import { Orchestrator } from "common/transaction.types";
import { authSessionWorkers } from "workers/auth-session.worker";
import { gameScenarioWorkers } from "workers/game-scenario.worker";
import { gameSessionWorkers } from "workers/game-session.worker";
import { gameWorkers } from "workers/game.worker";

type GameSessionOrchestrators = {
    startNewGame: Orchestrator<{scenarioId: string; sessionId: string}, GameSession | null>;
}

export const gameSessionOrchestrators: GameSessionOrchestrators = {
    startNewGame: async ({scenarioId, sessionId}) => {
        return prismaTransaction(async tx => {
            const scenario = await gameScenarioWorkers.getGameScenario(tx, { scenarioId});
            if (!scenario) return null;
            // const game = await gameWorkers.getGameById(tx, {id: scenario?.meta.game_id});
            const session = await authSessionWorkers.get(tx, {sessionId});
            if (!session) return null;
            const gameSession = await gameSessionWorkers.startNew(tx, {gameId: scenario.meta.game_id, playerId: session.player_id});
            return gameSession;
        })
    }
}