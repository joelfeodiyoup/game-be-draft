import { gamesRepository } from "@/repositories/games.repository";
import { scenarioRepository } from "@/repositories/scenario.repository";

export async function getGames() {
    const games = await gamesRepository.getAll();

    return games;
}

export async function getScenarios({gameId}: {gameId: string}) {
    const scenarios = await scenarioRepository.findByGameId({game_id: gameId});

    return scenarios ?? [];
}