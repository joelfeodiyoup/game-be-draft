import { useGameContext } from "@/contexts/game-context/GameContext"

export const GameRuntime = () => {
    const {game} = useGameContext();

    return <>
        {game && <>
            <strong>currently playing: {game.name}</strong>
            <p>{game.scenario}</p>
        </>
        }
    </>
}