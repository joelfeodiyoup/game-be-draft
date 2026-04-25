import { useState } from "react"
import { GameContext } from "./GameContext"
import type { Game } from "@backend/types";

export const GameContextProvider = ({children}: {children: React.ReactNode}) => {
    const [game, setGame] = useState<Game | null>(null);

    return <GameContext.Provider value={{game, setGame}}>{children}</GameContext.Provider>
}