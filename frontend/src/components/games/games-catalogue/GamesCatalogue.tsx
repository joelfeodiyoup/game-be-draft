import type { Game, Scenario } from "@backend/types";
import { useGamesCatalogue } from "./useGamesCatalogue";
import styles from './GamesCatalogue.module.scss';

export const GamesCatalogue = () => {
    const {gamesQuery, scenariosQuery, getIsSelectedGame, handleSelectingGame} = useGamesCatalogue()

    console.log('scenariosQuery:', {
        data: scenariosQuery.data,
        isLoading: scenariosQuery.isLoading,
        isFetching: scenariosQuery.isFetching,
        isSuccuss: scenariosQuery.isSuccess
    })

    if (gamesQuery.isError) return <div>Error: {gamesQuery.error.message}</div>
    if (scenariosQuery.isError) return <div>Error: {scenariosQuery.error.message}</div>

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
                    {getIsSelectedGame(game) && (
                        <ul className={styles.scenarios}>
                            scenarios:
                            {scenariosQuery.data?.length === 0 && <p>none</p>}
                            {(scenariosQuery.data ?? []).map(scenario => (
                                <ScenarioItem
                                    className={styles.scenario}
                                    key={scenario.id}
                                    scenario={scenario}
                                />
                            ))}
                        </ul>
                    )}
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

type ScenarioItemProps = React.ComponentPropsWithoutRef<'li'> & {
    scenario: Scenario;
};
const ScenarioItem = ({ scenario, ...props }: ScenarioItemProps) => {
    return <li {...props}>{scenario.title}</li>
}