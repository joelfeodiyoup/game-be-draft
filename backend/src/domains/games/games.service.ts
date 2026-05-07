import { createScenarioSaveRepository } from '@/repositories/scenario-save.repository';
import { gameStateRepository } from '../../repositories/game-state.repository';
import { prismaTransaction } from '@/databases/postgres/db';

export async function saveGame(
    {gameState, scenarioId, playerId}: {
        scenarioId: string,
        gameState: any,
        playerId: string
    }) {
    return prismaTransaction(async tx => {
        const savedGameState = await gameStateRepository.create({gameState});
        const savedScenario = await createScenarioSaveRepository(tx).create({stateId: savedGameState.id, playerId, scenarioId})
        
        return savedScenario;
    })
}