// thin. just validation and HTTP concerns.
import { Hono } from 'hono';
import * as authService from './auth.service';

export const authRouter = new Hono();

authRouter.post('/register', async (c) => {
    const body = await c.req.json();
    const result = await authService.register(body);
    return c.json(result, 201);
});

authRouter.post('/login', async (c) => {
    const body = await c.req.json();
    const session = await authService.login(body);
    if (!session) return c.json({ error: 'Invalid credentials'}, 401);
    return c.json(session);
});

authRouter.post('/logout', async c => {
    const body = await c.req.json();
    const session = await authService.logout(body);
    return c.json(session);
})