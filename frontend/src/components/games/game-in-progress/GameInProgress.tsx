import { Button } from "@/components/ui/button/Button";
import { Section } from "@/components/ui/section/Section";
import { Stack } from "@/components/ui/stack/Stack";
import { useGameContext } from "@/contexts/game-context/GameContext"
import { useCallback, useState } from "react";

export const GameInProgress = () => {
    const { game } = useGameContext();

    // I could perhaps make a custom hook here to handle more dynamic game stuff.
    const [gameState, setGameState] = useState<string>('');
    const handleSave = useCallback(() => {
        console.log('saving...');
        console.log(gameState)
    }, [gameState])

    if (!game) return null;
    return <Stack>
        <Section title="currently playing">{game.title}</Section>
        <Section title="menu"><Button onClick={handleSave}>save</Button></Section>
        <Section title="state">
            <p>This is a rough model of the game changing some state. In reality there would be something more interesting saved, and the game can decide whatever that is.</p>
            <p>Right now it's just a text input field, and it'll save to mongodb</p>
            <input type="text" onChange={event => setGameState(event.target.value)} />
            </Section>
    </Stack>
}