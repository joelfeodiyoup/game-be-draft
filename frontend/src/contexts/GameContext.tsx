import { createContext, useContext } from "react";

export type Game = {name: string; scenario: string};
export const GameContext = createContext<{game: Game | null; setGame: (value: Game | null) => void}>({game: null, setGame: () => {}})

export const useGameContext = () => useContext(GameContext);