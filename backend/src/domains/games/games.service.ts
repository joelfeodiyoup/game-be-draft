import { scenarioSaveRepository } from '../../repositories/scenario-save.repository';
import { gameStateRepository } from '../../repositories/game-state.repository';

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