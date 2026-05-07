import type { Game } from "@/types/api";
import { createContext, useContext } from "react";

export const GameContext = createContext<{
    game: Game | null;
    setGameId: (value: string) => void;
    refetchGame: () => void;
}>({
    game: null,
    setGameId: () => {},
    refetchGame: () => {}
})

export const useGameContext = () => useContext(GameContext);