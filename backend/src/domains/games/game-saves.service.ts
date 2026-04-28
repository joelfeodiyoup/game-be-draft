import prisma from "@/databases/postgres/db";
import { gameStateRepository } from "@/repositories/game-state.repository";
import { createScenarioSaveRepository } from "@/repositories/scenario-save.repository";

export async function getSavedGame({scenarioSaveId}: {scenarioSaveId: string}) {
    return prisma.$transaction(async tx => {
        const savedScenario = await createScenarioSaveRepository(tx).getSaveById({ whereId: { id: scenarioSaveId}});
        if (!savedScenario || !savedScenario.mongodb_state_id) {
            return null;
        }
        const savedData = await gameStateRepository.getById({ id: savedScenario?.mongodb_state_id });
        
        return { meta: savedScenario, data: savedData };
    })
}
