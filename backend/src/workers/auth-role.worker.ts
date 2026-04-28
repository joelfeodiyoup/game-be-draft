import { AuthRole as AuthRoleTypes } from "@/domains/auth/auth.types";
import { createAuthRoleRepository } from "@/repositories/auth-role.repository";
import { AuthRole, Player } from "@prisma/client";
import { Worker } from "common/transaction.types";

type UserAndRole = {
    role: AuthRoleTypes,
    playerId: string
}

type AuthRoleWorkers = {
    assign: Worker<UserAndRole, AuthRole>,
    userHasRole: Worker<UserAndRole, boolean>,
}
export const authRoleWorkers: AuthRoleWorkers = {
    assign: async (tx, args) => {
        return createAuthRoleRepository(tx).create({player: {connect: {id: args.playerId}}, role: args.role});
    },
    userHasRole: async (tx, {role, playerId}) => {
        const foundRole = await createAuthRoleRepository(tx).getPlayerRole({player_id: playerId, role});
        
        return !!foundRole;
    }
}