import { useQuery } from "@tanstack/react-query"
import { defaultFetchOptions, urls } from "../../data/fetchOptions"

import type { Game } from '@backend/types';
import { useState } from "react";
import { Scenarios } from "./Scenarios";

export const Games = () => {
    const gamesQuery = useQuery<Game[]>({
        queryFn: async () => {
            const response = await fetch(urls.getGames, {...defaultFetchOptions});
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            return response.json();
        },
        queryKey: ['get-games'],
    });

    const [selectedGame, setSelectedGame] = useState<Game | null>();

    if (gamesQuery.isLoading) return <div>Loading games...</div>;
    if (gamesQuery.isError) return <div>Error: {gamesQuery.error.message}</div>;

    console.log(gamesQuery.data);
    return <>
        <ul>

        {gamesQuery.data?.map(game => (
            <>
                <li onClick={() => setSelectedGame(game)}>{game.title}
                    {selectedGame?.id === game.id && <Scenarios game={game} />}
                </li>
            </>
        ))}
        </ul>
    </>
}