import { Worker } from "common/transaction.types";
import { Player } from "types";
import { createPlayerRepository } from "@/repositories/player.repository";
import { LoginCredentials } from "@/domains/auth/auth.types";
import { hashPassword, verifyPassword } from "./password.worker";
import { disallowInProduction } from "@/utils/environment-guards";
import { authSessionWorkers } from "./auth-session.worker";

type PlayerWorkers = {
    create: Worker<LoginCredentials, Player>;
    isValid: Worker<LoginCredentials, (Player | null)>;
    deleteAll: Worker<undefined, void>;
    getAll: Worker<void, Player[]>;
}

export const playerWorkers: PlayerWorkers = {
    create: async (tx, args) => {
        const hashedPassword = hashPassword(args.password);
        const player = createPlayerRepository(tx).create({username: args.username, password_hash: hashedPassword });
    
        return player;
    },
    isValid: async (tx, {username, password}) => {
        // find user by username in Player table
        const player = await createPlayerRepository(tx).findByUsername({username});
    
        if (!player) return null;
    
        const passwordMatches = verifyPassword({password, hash: player.password_hash});
    
        return passwordMatches ? player : null;
    },
    deleteAll: async (tx) => {
        disallowInProduction();
        await createPlayerRepository(tx).deleteAll();
    },
    getAll: async (tx) => {
        return await createPlayerRepository(tx).getAll();
    }
}