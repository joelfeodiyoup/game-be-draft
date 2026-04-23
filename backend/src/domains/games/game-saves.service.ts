import { authSessionRepository } from "@/repositories/auth-session.repository";
import { gameSessionRepository } from "@/repositories/game-session.repository";
import { gameStateRepository } from "@/repositories/game-state.repository";
import { gamesRepository } from "@/repositories/games.repository";
import { scenarioSaveRepository } from "@/repositories/scenario-save.repository";
import { scenarioStateRepository } from "@/repositories/scenario-state.repository";
import { scenarioRepository } from "@/repositories/scenario.repository";

export async function getSavedGame({scenarioSaveId}: {scenarioSaveId: string}) {
    const savedScenario = await scenarioSaveRepository.getSaveById({ whereId: { id: scenarioSaveId}});
    if (!savedScenario || !savedScenario.mongodb_state_id) {
        return null;
    }
    const savedData = await gameStateRepository.getById({ id: savedScenario?.mongodb_state_id });

    return { meta: savedScenario, data: savedData };
}
