import type { Game } from "@backend/types";
import { createContext, useContext } from "react";

export const GameContext = createContext<{game: Game | null; setGame: (value: Game | null) => void}>({game: null, setGame: () => {}})

export const useGameContext = () => useContext(GameContext);