import { useGameContext } from "@/contexts/GameContext";
import { urls, defaultFetchOptions } from "@/data/fetchOptions";
import type { Game } from "@backend/types";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";

export const useGamesCatalogue = () => {
    const gamesQuery = useQuery<Game[]>({
        queryFn: async () => {
            const response = await fetch(urls.getGames, {...defaultFetchOptions});
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            return response.json();
        },
        queryKey: ['get-games'],
        placeholderData: [],
    });

    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const { setGame } = useGameContext();


    const handleSelectingGame = useCallback((game: Game) => {
        if (selectedGame?.id === game.id) {
            setGame(null);
            setSelectedGame(null);
        } else {
            setGame(game);
            setSelectedGame(game);
        }
    }, [selectedGame?.id]);

    const getIsSelectedGame = useCallback((game: Game) => {
        return game.id === selectedGame?.id;
    }, [selectedGame?.id])

    return {
        handleSelectingGame,
        gamesQuery,
        getIsSelectedGame
    }
}