import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { getGames, getScenarios } from './game-catalog.service';
import { startNewGame } from './game-session.service';

export const gamesRouter = new Hono();

gamesRouter.get('/', async (c) => {
    const result = await getGames();
    return c.json(result);
})

/** get all scenarios for a particular game */
gamesRouter.get('/:id/scenarios', async (c) => {
    const id = c.req.param('id');

    const scenarios = await getScenarios({gameId: id});
    return c.json(scenarios ?? []);
});

gamesRouter.post('/:gameId/scenarios/:scenarioId/start-new', async c => {
    const gameId = c.req.param('gameId');
    const scenarioId = c.req.param('scenarioId');
    const sessionId = await getCookie(c, 'sessionId');
    if (!sessionId) {
        throw new Error('no session');
    }

    const newGame = await startNewGame({scenarioId, sessionId})
    return c.json(newGame);
})