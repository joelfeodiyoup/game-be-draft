import { authOrchestrators } from "@/domains/auth/auth.orchestrator";
import { Seed } from "./seed.types";
import { gameRatingsOrchestrators } from "@/domains/games/game-rating.orchestrator";
import { disallowInProduction } from "@/utils/environment-guards";
import { faker } from '@faker-js/faker';
import { GameRatingValue } from "@/domains/games/game-rating.schema";
import { gamesOrchestrators } from "@/domains/games/game-catalog.orchestrator";

export const seedGameRatings: Seed = {
    seed: async function () {
        const users = await authOrchestrators.getUsers();
        const games = await gamesOrchestrators.getAll();

        for (const user of users) {
            const rating = Math.floor(Math.random() * 6);
            console.log(rating);
            console.log(games[0]);
            await gameRatingsOrchestrators.rateGame({
                rating,
                comment: faker.lorem.paragraphs(1),
                playerId: user.id,
                gameId: games[0]?.id,
            });
        }
    },
    delete: function (): Promise<void> {
        disallowInProduction();
        return gameRatingsOrchestrators.deleteAllGameRatings();
    }
}