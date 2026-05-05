import { useGameContext } from "@/contexts/GameContext";
import { api } from "@/lib/api";
import type { Game } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useGameRating = ( {game }: {game: Game | null }) => {

    const { refetchGame } = useGameContext();

    const [rateGameState, setRateGameState] = useState<{comment: string, rating: number | null}>({comment: '', rating: null})
    const rateGameMutation = useMutation({
        mutationFn: async () => {
            if (!game || !rateGameState.rating) return;
            const { response } = await api.POST('/games/{gameId}/ratings', {
                body: {...rateGameState, rating: rateGameState.rating!},
                params: { path: { gameId: game.id}}
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw {status: response.status, message: 'login is required to rate games'};
                }
                throw {status: response.status, message: 'error occurred'};
            }
            refetchGame();
        }
    });

    // const myGameRating = useQuery({
    //     queryFn: async () => {
    //         const {} = await api.GET()
    //     }
    // })

    return {
        mutation: rateGameMutation,
        setState: setRateGameState,
        state: rateGameState,
    }
}