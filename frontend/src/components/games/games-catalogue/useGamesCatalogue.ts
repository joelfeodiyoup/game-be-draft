import { urls, defaultFetchOptions } from "@/data/fetchOptions";
import type { Game, Scenario } from "@backend/types";
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

    const scenariosQuery = useQuery<Scenario[]>({
        queryFn: async () => {
            if (!selectedGame) return [];
            const response = await fetch(urls.getScenarios({gameId: selectedGame.id}));
            if (!response.ok) {
                throw new Error(`could not retrieve scenarios for game ${selectedGame?.id}`)
            }
            return response.json();
        },
        enabled: !!selectedGame,
        queryKey: [`get-scenarios-`, {gameId: selectedGame?.id}],
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for this duration
        placeholderData: []
    });

    const handleSelectingGame = useCallback((game: Game) => {
        console.log('selected it');
        console.log(game);
        if (selectedGame?.id === game.id) {
            setSelectedGame(null);
        } else {
            setSelectedGame(game);
        }
    }, [selectedGame?.id]);

    const getIsSelectedGame = useCallback((game: Game) => {
        return game.id === selectedGame?.id;
    }, [selectedGame?.id])

    return {
        handleSelectingGame,
        gamesQuery,
        scenariosQuery,
        getIsSelectedGame
    }
}