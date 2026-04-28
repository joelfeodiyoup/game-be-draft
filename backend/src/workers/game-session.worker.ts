import { createGameSessionRepository } from "@/repositories/game-session.repository"
import { GameSession } from "@prisma/client"
import { Worker } from "common/transaction.types"

type GameSessionWorkers = {
    startNew: Worker<{gameId: string, playerId: string}, GameSession>
}
export const gameSessionWorkers: GameSessionWorkers = {
    startNew: async (tx, {gameId, playerId}) => {
        const gameSession = await createGameSessionRepository(tx).create({data: {
            game: {connect: {id: gameId}},
            player: {connect: {id: playerId}}
        }});
        return gameSession;
    }
}