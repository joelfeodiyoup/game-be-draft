import type { Game } from "@/types/api";
import { createContext, useContext } from "react";

export const GameContext = createContext<{game: Game | null; setGameId: (value: string) => void}>({game: null, setGameId: () => {}})

export const useGameContext = () => useContext(GameContext);