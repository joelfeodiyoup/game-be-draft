import { Authentication } from "./components/authentication/Authentication";
import { GamesCatalogue } from "./components/games/games-catalogue/GamesCatalogue";
import { Title } from "./components/ui/title/Title";
import { useErrorContext } from "./contexts/ErrorContext";
import { useGameContext } from "./contexts/GameContext";
import { GameRuntime } from "./game-runtime/GameLoader";
import { AppLayout } from "./layouts/AppLayout";
import { HeaderLayout } from "./layouts/HeaderLayout";
function App() {
  const {game} = useGameContext();
  const { errorMessage } = useErrorContext();

  return (
    <>
      <AppLayout
        header={<HeaderLayout title={<Title text="Game Loader" />} authSection={<Authentication />} />}
        error={errorMessage}
        left={<GamesCatalogue />}
        main={game && <GameRuntime />}
        right={null}
      />
    </>
  )
}

export default App
