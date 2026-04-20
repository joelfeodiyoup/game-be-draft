// thin. just validation and HTTP concerns.
import { Hono } from 'hono';
import { setCookie, getCookie } from 'hono/cookie';
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
    
    setCookie(c, 'sessionId', session.id, {httpOnly: true});
    setCookie(c, 'isLoggedIn', 'true', {httpOnly: false});

    return c.json(session);
});

authRouter.post('/logout', async c => {
    const sessionId = await getCookie(c, 'sessionId');
    setCookie(c, 'sessionId', '', {httpOnly: true, maxAge: 0});
    setCookie(c, 'isLoggedIn', '', {httpOnly: false, maxAge: 0});
    if (!sessionId) {
        return c.json({message: 'success'}, 200)
    }
    const session = await authService.logout({sessionId});
    return c.json(session);
})