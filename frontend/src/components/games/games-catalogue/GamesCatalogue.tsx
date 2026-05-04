import { useGamesCatalogue } from "./useGamesCatalogue";
import styles from './GamesCatalogue.module.scss';
import type { Game } from "@/types/api";
import { useGameContext } from "@/contexts/GameContext";

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
    game: Game;
    onGameSelect: (game: Game) => void;
    children?: React.ReactNode;
};
const GameItem = ({ game, isSelected, onGameSelect, children, className, ...props }: GameItemProps) => (
    <li
        {...props}
        className={`${className} ${isSelected ? styles.selected : ''}`}
    >
        <span onClick={() => onGameSelect(game)}>
            {game.title}
        </span>
        {isSelected && children}
    </li>
);
