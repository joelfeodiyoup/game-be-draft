import { connect } from 'http2';
import prisma from '../src/databases/postgres/db';
import { transportTycoonScenarios } from './seed-data/game-scenarios';
import { games } from './seed-data/games';
import { connectMongo, disconnectMongo } from '../src/databases/mongodb/db';
import { clearAllScenarios, createScenario } from '../src/domains/games/scenario.service';
import { assignRoleToUser, clearAllAuthRoles } from '@/domains/auth/auth-role.service';
import { deleteAllUsers, register } from '@/domains/auth/auth.service';

async function main() {
    console.log('seeding database...');

    // clear existing data
    // await prisma.scenario.deleteMany();
    await clearAllScenarios();
    await prisma.game.deleteMany();

    await deleteAllUsers();
    await clearAllAuthRoles();


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
            await createScenario({
                ...scenario,
                gameId: transportTycoonGame.id,
            });
        }
    }

    // seed users
    const users: { username: string; password: string; isAdmin: boolean}[] = [
        {username: 'agata', password: 'password', isAdmin: false},
        {username: 'admin', password: 'admin', isAdmin: true},
    ];
    for (const {username, password, isAdmin} of users) {
        const player = await register({username, password});
        if (isAdmin) {
            await assignRoleToUser({player, role: 'ADMIN'});
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
        await disconnectMongo();
    });