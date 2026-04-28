import { Worker } from "common/transaction.types";
import { Player } from "types";
import { AuthSession } from "@prisma/client";
import { createAuthSessionRepository } from "@/repositories/auth-session.repository";

const getNowPlusExpiryTime = () => {
    return new Date(Date.now() + 1000 * 60 * 60 * 1);
}

type AuthSessionWorkers = {
    expire: Worker<{sessionId: string}, AuthSession>;
    create: Worker<Player, AuthSession>;
    get: Worker<{sessionId: string}, AuthSession | null>;
    extend: Worker<{sessionId: string}, AuthSession>;
}

export const authSessionWorkers: AuthSessionWorkers = {
    expire: (tx, {sessionId}) => {
        const now = new Date();
        return createAuthSessionRepository(tx).update({data: { expires_at: now}, where: {id: sessionId}});
    },
    create: async (tx, player) => {
        const session = await createAuthSessionRepository(tx).create({
            player: { connect: {id: player.id }},
            expires_at: getNowPlusExpiryTime(),
        });
        return session;
    },
    get: async (tx, {sessionId}) => {
        const session = await createAuthSessionRepository(tx).findById({id: sessionId});
        if (!session) return null;
        const now = new Date();
        const isExpiringInFuture = session.expires_at > now;
        
        return isExpiringInFuture ? session : null;
    },
    extend: async (tx, {sessionId}) => {
        return createAuthSessionRepository(tx).update({where: { id: sessionId}, data: {expires_at: getNowPlusExpiryTime()}})
    }
}