import { connect } from 'http2';
import prisma from '../src/databases/postgres/db';
import { transportTycoonScenarios } from './seed-data/game-scenarios';
import { games } from './seed-data/games';

async function main() {
    console.log('seeding database...');

    // clear existing data
    await prisma.scenario.deleteMany();
    await prisma.game.deleteMany();

    // seed games
    const createdGames = [];
    for (const game of games) {
        const createdGame = await prisma.game.create({data: game});
        createdGames.push(createdGame);
    }

    // seed scenarios
    const transportTycoonGame = createdGames.find(game => game.title === 'transport tycoon');
    if (transportTycoonGame) {
        for (const scenario of transportTycoonScenarios) {
            await prisma.scenario.create({
                data: {
                    ...scenario,
                    game: { connect: { id: transportTycoonGame.id } }
                }
            });
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });