import { disallowInProduction } from "@/utils/environment-guards";
import { prismaTransaction } from "@/databases/postgres/db";
import { Orchestrator } from "common/transaction.types";
import { gameScenarioWorkers } from "workers/game-scenario.worker";
import { Scenario } from "types";

type ScenarioOrchestrators = {
    clearAllScenarios: Orchestrator<void, boolean>;
    createScenario: Orchestrator<{title: string, description: string, gameId: string, scenarioState: any}, Scenario>;
}

export const scenarioOrchestrators: ScenarioOrchestrators = {
    clearAllScenarios: () => {
        disallowInProduction();
    
        return prismaTransaction(async tx => {
            await gameScenarioWorkers.deleteAll(tx);

            return true;
        })
    },
    createScenario: async ({title, description, gameId, scenarioState}) => {
        return prismaTransaction(async tx => {
            const state = await gameScenarioWorkers.saveGameState(tx, {scenarioState});
            const savedMeta = await gameScenarioWorkers.saveGameMeta(tx, {title, description, gameId, gameStateLocationId: state.id});

            return savedMeta;
        })
    }

}