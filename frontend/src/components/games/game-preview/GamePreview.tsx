import { useGameContext } from "@/contexts/GameContext";

export const GamePreview = () => {
    const { game } = useGameContext();

    return <>
        <p>rate the game</p>
        <p>description of scenario</p>
    </>;
}