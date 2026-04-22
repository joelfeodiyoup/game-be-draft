import { defaultFetchOptions, urls } from "@/data/fetchOptions";
import { useMutation } from "@tanstack/react-query"

export const Scenario = ({scenarioId, gameId}: {scenarioId: string, gameId: string}) => {
    const startNewScenarioMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(urls.startNewScenario({scenarioId, gameId}), {
                ...defaultFetchOptions,
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('could not start scenario');
            }
        }
    });

    return <button onClick={() => startNewScenarioMutation.mutate()}>start new</button>
}