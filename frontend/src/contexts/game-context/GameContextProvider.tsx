import { useState } from "react"
import { GameContext } from "./GameContext"
import type { Game } from "@/types/api";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const GameContextProvider = ({children}: {children: React.ReactNode}) => {
    const [game, setGame] = useState<Game | null>(null);
    const [gameId, setGameId] = useState('');
    // const queryClient = useQueryClient();

    const { refetch } = useQuery({
        queryFn: async () => {
            if (!gameId) return null;

            const { response, data } = await api.GET('/games/{gameId}', {
                params: { path: { gameId} }
            });

            if (!response.ok || !data) {
                throw new Error('error');
            }

            setGame(data);

            return data;
        },
        queryKey: ['get-game', gameId],
    });

    return <GameContext.Provider value={{game, setGameId, refetchGame: refetch}}>{children}</GameContext.Provider>
}