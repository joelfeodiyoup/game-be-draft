import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query"

export const Scenario = ({scenarioId, gameId}: {scenarioId: string, gameId: string}) => {
    // const { setGameId } = useGameContext();
    const startNewScenarioMutation = useMutation({
        mutationFn: async () => {
            const { response } = await api.POST('/games/{gameId}/scenarios/{scenarioId}/start-new', {
                params: { path: { scenarioId, gameId }}
            });
            if (!response.ok) {
                throw new Error('could not start scenario');
            }
            // const game = data;
            // setGameId(game.id);
        },
    });

    return <button onClick={() => startNewScenarioMutation.mutate()}>start new</button>
}