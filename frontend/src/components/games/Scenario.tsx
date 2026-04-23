import { useGameContext } from "@/contexts/GameContext";
import { defaultFetchOptions, urls } from "@/data/fetchOptions";
import { useMutation } from "@tanstack/react-query"

export const Scenario = ({scenarioId, gameId}: {scenarioId: string, gameId: string}) => {
    const { setGame } = useGameContext();
    const startNewScenarioMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(urls.startNewScenario({scenarioId, gameId}), {
                ...defaultFetchOptions,
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('could not start scenario');
            }
            const game = await response.json();
            console.log(game);
            setGame({name: game.game.title, scenario: game.scenario.title});
        },
    });

    return <button onClick={() => startNewScenarioMutation.mutate()}>start new</button>
}