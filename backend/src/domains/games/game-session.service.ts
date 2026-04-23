import { authSessionRepository } from "@/repositories/auth-session.repository";
import { gameSessionRepository } from "@/repositories/game-session.repository";
import { gamesRepository } from "@/repositories/games.repository";
import { scenarioStateRepository } from "@/repositories/scenario-state.repository";
import { scenarioRepository } from "@/repositories/scenario.repository";

export async function startNewGame({scenarioId, sessionId}: {scenarioId: string, sessionId: string}) {
    // get the scenario metadata
    const scenario = await scenarioRepository.findById({whereScenario: { id: scenarioId}});
    if (!scenario) {
        throw new Error('scenario not found');
    }

    // get scenario initial state
    const scenarioState = await scenarioStateRepository.getById({id: scenario?.mongo_state_id});

    // get the game
    const game = await gamesRepository.getById({whereGame: {id: scenario.game_id}});
    if (!game) { 
        throw new Error('game not found');
    }

    const authSession = await authSessionRepository.findById({id: sessionId});
    if (!authSession) {
        throw new Error('no auth session');
    }

    // create new game session for player
    const gameSession = await gameSessionRepository.create({data: {
        player: { connect: { id: authSession.player_id } },
        game: {
            connect: {id: game.id}
        }
    }});

    return {gameSession, game, scenarioState, scenario};
}