import prisma from '@/databases/postgres/db';
import { authOrchestrators } from '@/domains/auth/auth.orchestrator';
import { AuthRole } from '@/domains/auth/auth.types';
import { ErrorResponse } from 'common/api-responses';
import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

const createErrorResponse = (error: string, message?: string): ErrorResponse => ({
    error,
    message
});

const unauthorizedResponse = (c: Context) => {
    return c.json(createErrorResponse('Unauthorized'), 401);
}

export const requireAuth = createMiddleware(async (c, next) => {
    return prisma.$transaction(async tx => {
        const sessionId = await getCookie(c, 'sessionId');
        if (!sessionId) return unauthorizedResponse(c);
        const validSession = await authOrchestrators.getValidSession({sessionId});
        if (!validSession) return unauthorizedResponse(c);
        
        await next();
    })
})

export const requireRole = (role: AuthRole) => createMiddleware(async (c, next) => {
    return prisma.$transaction(async tx => {
        const sessionId = await getCookie(c, 'sessionId');
        if (!sessionId) return unauthorizedResponse(c);
        const validSession = await authOrchestrators.getValidSession({sessionId});
        if (!validSession) return unauthorizedResponse(c);
        
        const hasRole = await authOrchestrators.userHasRole({playerId: validSession.player_id, role});
        
        if (!hasRole) return unauthorizedResponse(c);
        
        await next();
    })
})