import { disallowInProduction } from "@/utils/environment-guards";
import { scenarioStateRepository } from "../../repositories/scenario-state.repository";
import { scenarioRepository } from "../../repositories/scenario.repository";

export async function clearAllScenarios() {
    disallowInProduction();

    await scenarioRepository.deleteAll();
    await scenarioStateRepository.deleteAll();
}

export async function createScenario({title, description, gameId, scenarioState}: {title: string, description: string, gameId: string, scenarioState: any}) {
    const savedState = await scenarioStateRepository.create({scenarioState });
    const savedMeta = await scenarioRepository.create({data: {
        title, description, mongo_state_id: savedState.id,
        game: {
            connect: { id: gameId}
        }
    }});
}