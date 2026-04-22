import type { Game, Scenario as ScenarioType } from "@backend/types"
import { useQuery } from "@tanstack/react-query";
import { Scenario } from "./Scenario";
import { urls } from "@/data/fetchOptions";

export const Scenarios = ({game}: {game: Game}) => {
    const scenariosQuery = useQuery<ScenarioType[]>({
        queryFn: async () => {
            const response = await fetch(urls.getScenarios({gameId: game.id}));
            if (!response.ok) {
                throw new Error(`could not retrieve scenarios for game ${game.id}`)
            }
            return response.json();
        },
        queryKey: [`get-scenarios-${game.id}`]
    })
    if (scenariosQuery.isLoading) return <div>Loading scenarios...</div>
    if (scenariosQuery.isError) return <div>Error {scenariosQuery.error.message}</div>

    if (scenariosQuery.data.length === 0) return <div>no scenarios found</div>

    return <>
        <ul>
            {scenariosQuery.data.map(scenario => (
                <li>{scenario.title} - {scenario.description}<Scenario scenarioId={scenario.id} gameId={scenario.game_id}/></li>
            ))}
        </ul>
    </>
}