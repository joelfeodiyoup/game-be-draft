import { scenarioStateRepository } from "@/repositories/scenario-state.repository";
import { createScenarioRepository } from "@/repositories/scenario.repository";
import { disallowInProduction } from "@/utils/environment-guards";
import { Worker } from "common/transaction.types"
import { Scenario } from "types";

type GameScenarioWorkers = {
    saveGameState: Worker<{scenarioState: any}, {id: string}>;
    saveGameMeta: Worker<{title: string; description: string; gameId: string; gameStateLocationId: string}, Scenario>;
    deleteAll: Worker<void, void>;
    getGameScenario: Worker<{scenarioId: string}, {meta: Scenario; state: any} | null>;
    getGameScenarios: Worker<{gameId: string}, {scenarios: Scenario[]} | null>;
}
export const gameScenarioWorkers: GameScenarioWorkers = {
    saveGameState: async (tx, { scenarioState }) => {
        const savedState = await scenarioStateRepository.create({scenarioState });

        return {id: savedState.id}
    },
    saveGameMeta: async (tx, { title, description, gameId, gameStateLocationId }) => {
        const savedMeta = await createScenarioRepository(tx).create({data: {
            title, description, mongo_state_id: gameStateLocationId,
            game: {
                connect: { id: gameId}
            }
        }});

        return savedMeta;
    },
    deleteAll: async (tx) => {
        disallowInProduction();
        await createScenarioRepository(tx).deleteAll();
        await scenarioStateRepository.deleteAll();
    },
    getGameScenario: async (tx, {scenarioId}) => {
        const meta = await createScenarioRepository(tx).findById({whereScenario: { id: scenarioId}});
        if (!meta) return null;
        const state = await scenarioStateRepository.getById({id: meta.mongo_state_id});

        return {meta, state};
    },
    getGameScenarios: async (tx, {gameId}) => {
        const scenarios = await createScenarioRepository(tx).findByGameId({game_id: gameId});
        return {scenarios};
    }
}