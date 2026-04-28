import { Button } from "@/components/ui/button/Button";
import { useGameContext } from "@/contexts/GameContext"
import { defaultFetchOptions, urls } from "@/data/fetchOptions";
import type { Scenario } from "@backend/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const GameDetail = () => {
    const { game } = useGameContext();

    const scenariosQuery = useQuery<{scenarios: Scenario[]}>({
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
        placeholderData: {scenarios: []}
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

    const rateGameMutation = useMutation({
        mutationFn: async ({rating}: {rating: number}) => {
            if (!game) return;
            const response = await fetch(urls.rateGame({gameId: game.id}), {
                ...defaultFetchOptions,
                method: 'POST',
                body: JSON.stringify({ rating }),
            });
            if (!response.ok) {
                // throw {st}
            }
        }
    })

    if (!game) return <div>no game selected</div>
    if (scenariosQuery.isLoading) return <div>Loading...</div>
    return <div>
        <h2>{game.title}</h2>
        <div>{game.description}</div>
        <br />
        <div>current rating: {Number(game.average_rating)} from {game.rating_count} reviews</div>
        <h2>Rate game</h2>
        {[1,2,3,4,5].map(r => <Button key={r} onClick={() => rateGameMutation.mutate({ rating: r})}>{r}</Button>)}
        <Button onClick={() => createScenarioMutation.mutate()}>create new scenario (admin only)</Button>
        <ul>
            {!scenariosQuery.data || scenariosQuery.data.scenarios.length === 0 && <div>no scenarios</div>}
        {scenariosQuery.data?.scenarios.map(scenario => (
            <li key={scenario.id}>{scenario.title}<Button onClick={() => startGameSessionMutation.mutate({scenario})}>start</Button></li>
        ))}
        </ul>
    </div>
}