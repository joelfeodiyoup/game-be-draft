import { scenarioSaveRepository } from './repositories/scenario-save.repository';
import { gamesRepository } from './repositories/games.repository';
import { gameStateRepository } from './repositories/game-state.repository';
import { scenarioRepository } from './repositories/scenario.repository';
import { scenarioStateRepository } from './repositories/scenario-state.repository';
import { gameSessionRepository } from './repositories/game-session.repository';
import { authSessionRepository } from '../auth/repositories/auth-session.repository';

export async function getGames() {
    const games = await gamesRepository.getAll();

    return games;
}

export async function getScenarios({gameId}: {gameId: string}) {
    const scenarios = await scenarioRepository.findByGameId({game_id: gameId});

    return scenarios ?? [];
}

export async function saveGame(
    {gameState, scenarioId, playerId}: {
        scenarioId: string,
        gameState: any,
        playerId: string
    }) {
    const savedGameState = await gameStateRepository.create({gameState});
    const savedScenario = await scenarioSaveRepository.create({stateId: savedGameState.id, playerId, scenarioId})

    return savedScenario;
}

export async function getSavedGame({scenarioSaveId}: {scenarioSaveId: string}) {
    const savedScenario = await scenarioSaveRepository.getSaveById({ whereId: { id: scenarioSaveId}});
    if (!savedScenario || !savedScenario.mongodb_state_id) {
        return null;
    }
    const savedData = await gameStateRepository.getById({ id: savedScenario?.mongodb_state_id });

    return { meta: savedScenario, data: savedData };
}

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