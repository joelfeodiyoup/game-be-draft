import { useGamesCatalogue } from "./useGamesCatalogue";
import styles from './GamesCatalogue.module.scss';
import type { GamesListItem } from "@/types/api";
import { useGameContext } from "@/contexts/game-context/GameContext";
import { Button } from "@/components/ui/button/Button";

export const GamesCatalogue = () => {
    const {gamesQuery, getIsSelectedGame } = useGamesCatalogue();
    const { setGameId } = useGameContext();

    if (gamesQuery.isError) return <div>Error: {gamesQuery.error.message}</div>

    return (
        <ul className={styles.catalogue}>
            {(gamesQuery.data ?? []).map(game => (
                <GameItem
                    className={styles.game}
                    key={game.id}
                    game={game}
                    onGameSelect={() => setGameId(game.id)}
                    isSelected={getIsSelectedGame(game)}
                >
                </GameItem>
            ))}
        </ul>
    );
}

type GameItemProps = React.ComponentPropsWithoutRef<'li'> & {
    isSelected: boolean;
    game: GamesListItem;
    onGameSelect: (game: GamesListItem) => void;
    children?: React.ReactNode;
};
const GameItem = ({ game, isSelected, onGameSelect, children, className, ...props }: GameItemProps) => (
    <li
        {...props}
        className={`${className} ${isSelected ? styles.selected : ''}`}
    >
        <Button isSelected={isSelected} onClick={() => onGameSelect(game)}>
            {game.title}
        </Button>
        {isSelected && children}
    </li>
);
