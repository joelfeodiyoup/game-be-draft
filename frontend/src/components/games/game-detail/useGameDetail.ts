import { useGameContext } from "@/contexts/GameContext";
import { api } from "@/lib/api";
import type { Scenario } from "@/types/api";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useGameDetail = () => {
    const { game } = useGameContext();

    const scenariosQuery = useQuery({
        queryFn: async () => {
            if (!game) throw new Error('No game selected');
            const { response, data } = await api.GET('/games/{gameId}/scenarios', {
                params: { path: { gameId: game.id } }
            });
            if (!response.ok || !data) {
                throw {status: response.status, message: 'unauthenticated'};
            }
            return data;
        },
        enabled: !!game,
        queryKey: [`get-scenarios-`, {gameId: game?.id}],
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for this duration
        placeholderData: []
    });

    const createScenarioMutation = useMutation({
        mutationFn: async () => {
            if (!game) throw new Error('No game selected');
            const { response } = await api.POST('/games/{gameId}/scenarios', {
                body: undefined,
                params: { path: { gameId: game.id }}
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
            const { response } = await api.POST('/games/{gameId}/scenarios/{scenarioId}/start-new', {
                params: { path: {
                    gameId: game.id,
                    scenarioId: scenario.id
                }}
            });
            if (!response.ok) {
                throw {status: response.status, message: response.statusText};
            }
        }
    })

    

    return {
        startGameSessionMutation,
        createScenarioMutation,
        scenariosQuery,
        game,
    }
}