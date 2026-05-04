import { useGameContext } from "@/contexts/GameContext";
import { api } from "@/lib/api";
import type { Game } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export const useGamesCatalogue = () => {
    const { game } = useGameContext();
    const gamesQuery = useQuery({
        queryFn: async () => {
            const { response, data } = await api.GET('/games');
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            return data;
        },
        queryKey: ['get-games'],
        placeholderData: [],
    });

    const getIsSelectedGame = useCallback((selectedGame: Game) => {
        return game?.id === selectedGame.id;
    }, [])

    return {
        gamesQuery,
        getIsSelectedGame,
    }
}