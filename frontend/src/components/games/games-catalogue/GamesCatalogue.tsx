import type { Game } from "@backend/types";
import { useGamesCatalogue } from "./useGamesCatalogue";
import styles from './GamesCatalogue.module.scss';

export const GamesCatalogue = () => {
    const {gamesQuery, getIsSelectedGame, handleSelectingGame} = useGamesCatalogue()

    if (gamesQuery.isError) return <div>Error: {gamesQuery.error.message}</div>

    return (
        <ul className={styles.catalogue}>
            {(gamesQuery.data ?? []).map(game => (
                <GameItem
                    className={styles.game}
                    key={game.id}
                    game={game}
                    onGameSelect={handleSelectingGame}
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
