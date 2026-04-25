import { Button } from "@/components/ui/button/Button";
import { useGameContext } from "@/contexts/GameContext"
import { defaultFetchOptions, urls } from "@/data/fetchOptions";
import type { Scenario } from "@backend/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const GameDetail = () => {
    const { game } = useGameContext();

    const scenariosQuery = useQuery<Scenario[]>({
        queryFn: async () => {
            if (!game) return [];
            const response = await fetch(urls.getScenarios({gameId: game.id}));
            if (!response.ok) {
                throw {status: response.status, message: 'unauthenticated'};
            }
            return response.json();
        },
        enabled: !!game,
        queryKey: [`get-scenarios-`, {gameId: game?.id}],
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for this duration
        placeholderData: []
    });

    const createScenarioMutation = useMutation({
        mutationFn: async () => {
            if (!game) return [];
            const response = await fetch(urls.createScenario({gameId: game.id}), {
                method: 'POST'
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw { status: response.status, message: response.statusText};
                }
                throw {status: response.status, message: 'error'};
            }
        }
    })

    const startGameSessionMutation = useMutation({
        mutationFn: async ({scenario}: {scenario: Scenario}) => {
            if (!game) return;
            const response = await fetch(urls.startNewScenario({gameId: game.id, scenarioId: scenario.id}), {
                ...defaultFetchOptions,
                method: 'POST'
            });
            if (!response.ok) {
                throw {status: response.status, message: response.statusText};
            }
        }
    })

    if (!game) return <div>no game selected</div>
    if (scenariosQuery.isLoading) return <div>Loading...</div>
    return <div>
        <Button onClick={() => createScenarioMutation.mutate()}>create new scenario (admin only)</Button>
        <ul>
            {!scenariosQuery.data || scenariosQuery.data.length === 0 && <div>no scenarios</div>}
        {scenariosQuery.data?.map(scenario => (
            <li key={scenario.id}>{scenario.title}<Button onClick={() => startGameSessionMutation.mutate({scenario})}>start</Button></li>
        ))}
        </ul>
    </div>
}