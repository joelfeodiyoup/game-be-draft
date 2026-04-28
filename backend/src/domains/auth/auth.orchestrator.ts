// all business logic - auth flow, password hashing, session creation

import { AuthRole, LoginCredentials } from "./auth.types";
import { disallowInProduction } from "@/utils/environment-guards";
import prisma from "@/databases/postgres/db";
import { Orchestrator } from "common/transaction.types";
import { Player } from "types";
import { playerWorkers } from "workers/player.worker";
import { authSessionWorkers } from "workers/auth-session.worker";
import { authRoleWorkers } from "workers/auth-role.worker";
import { AuthSession } from "@prisma/client";


type AuthOrchestrators = {
    register: Orchestrator<LoginCredentials, Player>;
    login: Orchestrator<LoginCredentials, AuthSession>;
    logout: Orchestrator<{sessionId: string}, AuthSession>;
    getValidSession: Orchestrator<{sessionId: string}, AuthSession | null>;
    refreshSession: Orchestrator<{sessionId: string}, AuthSession>;
    deleteAllUsers: Orchestrator<void, void>;
    userHasRole: Orchestrator<{playerId: string, role: AuthRole}, boolean>;
    assignRole: Orchestrator<{playerId: string, role: AuthRole}, boolean>;
}

export const authOrchestrators: AuthOrchestrators = {
    /** create new player with hashed password */
    register: async (credentials: LoginCredentials) => {
        return prisma.$transaction(async tx => {
            const player = await playerWorkers.create(tx, credentials);
            await authRoleWorkers.assign(tx, {playerId: player.id, role: 'USER'});
            
            return player;
        })
    }, 
    /** validates credentials, create session */
    login: async (credentials) => {
        return prisma.$transaction(async tx => {
            const player = await playerWorkers.isValid(tx, credentials)
            // if not, return some error, otherwise...
            if (!player) {
                throw new Error('invalid credentials');
            }
            
            // create new 'session' in table
            const session = await authSessionWorkers.create(tx, player)
            
            // const userRoles = await createAuthRoleRepository(tx).getPlayerRoles({player_id: session.player_id});
            // return result to user
            return session;
        })
    },
    /** invalidate session */
    logout: async ({sessionId}) => {
        return prisma.$transaction(async tx => {
            return authSessionWorkers.expire(tx, {sessionId})
        })
    },
    /** check if session is valid and not expired */
    getValidSession: async ({sessionId}) => {
        return prisma.$transaction(async tx => {
            return authSessionWorkers.get(tx, {sessionId})
        })
    },
    /** extend session expiry */
    refreshSession: async ({sessionId}) => {
        return prisma.$transaction(async tx => {
            return authSessionWorkers.extend(tx, {sessionId});
        }) 
    },
    deleteAllUsers: async () => {
        disallowInProduction();
        return prisma.$transaction(async tx => {
            return await playerWorkers.deleteAll(tx, undefined);
        })
    },
    userHasRole: async ({playerId, role}) => {
        return prisma.$transaction(async tx => {
            return authRoleWorkers.userHasRole(tx, {playerId, role});
        })
    },
    assignRole: async ({ playerId, role}) => {
        return prisma.$transaction(async tx => {
            await authRoleWorkers.assign(tx, {playerId, role});
            return true;
        })
    }
}