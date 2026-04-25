import { userHasRole } from '@/domains/auth/auth-role.service';
import { AuthRole } from '@/domains/auth/auth.types';
import { authSessionRepository } from '@/repositories/auth-session.repository';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory'

export const requireAuth = createMiddleware(async (c, next) => {
    const sessionId = await getCookie(c, 'sessionId');
    const isAuthenticated = await authSessionRepository.findById({id: sessionId});
    if (!isAuthenticated || isAuthenticated.expires_at < new Date()) {
        return c.json({ error: 'Unauthorized'}, 401);
    }

    await next();
})

export const requireRole = (role: AuthRole) => createMiddleware(async (c, next) => {
    const sessionId = await getCookie(c, 'sessionId');
    const session = await authSessionRepository.findById({id: sessionId});
    if (!session) return c.json({error: 'Unauthorized'}, 401);

    const hasRole = await userHasRole({playerId: session.player_id, role});

    if (!hasRole) return c.json({error: 'Unauthorized'}, 401);

    await next();
})