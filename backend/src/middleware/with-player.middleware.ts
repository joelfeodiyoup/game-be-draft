import { authOrchestrators } from "@/domains/auth/auth.orchestrator";
import { Variables } from "@/domains/domains.types";
import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export async function withPlayer(c: Context<{ Variables: Variables}>, next: Next) {
    const sessionId = await getCookie(c, 'sessionId');
    if (!sessionId) throw new Error('No session');

    const validSession = await authOrchestrators.getValidSession({sessionId});
    if (!validSession) throw new Error('No session');

    c.set('playerId', validSession.player_id);
    c.set('sessionId', sessionId);
    await next();
}