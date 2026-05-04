import prisma from '../src/databases/postgres/db';
import { disconnectMongo } from '../src/databases/mongodb/db';
import { seedUsers } from './seed-data/users.seed';
import { seedGames } from './seed-data/games';
import { seedGameRatings } from './seed-data/game-ratings.seed';

async function main() {
    console.log('seeding database...');

    // clear existing data
    // await prisma.scenario.deleteMany();
    // await clearAllScenarios();
    // await prisma.game.deleteMany();

    // await deleteAllUsers();
    // await clearAllAuthRoles();


    

    // seed scenarios
    // const transportTycoonGame = createdGames.find(game => game.title === 'transport tycoon');
    // if (transportTycoonGame) {
    //     for (const scenario of transportTycoonScenarios) {
    //         await createScenario({
    //             ...scenario,
    //             gameId: transportTycoonGame.id,
    //         });
    //     }
    // }

    const seedSources = [seedUsers, seedGames, seedGameRatings];

    await Promise.all(seedSources.map((s) => s.delete()));

    for (const seedSource of seedSources) {
        await seedSource.seed();
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await disconnectMongo();
    });