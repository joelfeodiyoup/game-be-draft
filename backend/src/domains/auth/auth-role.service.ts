import { authRoleRepository } from "@/repositories/auth-role.repository";
import { disallowInProduction } from "@/utils/environment-guards";
import { Player } from "types";
import { AuthRole } from "./auth.types";

const roles: Record<string, AuthRole> = {
    user: 'USER',
    admin: 'ADMIN',
}

export async function giveUserBaseRole({player}: {player: Player}) {
    await authRoleRepository.create({ player: {connect: {id: player.id }}, role: roles.user });
}

export async function assignRoleToUser({player, role}: {player: Player, role: AuthRole}) {
    await authRoleRepository.create({player: {connect: {id: player.id}}, role});
}

export async function removeRoleFromUser({player, role}: {player: Player, role: AuthRole}) {
    await authRoleRepository.removeRole({player_id_role: {player_id: player.id, role }})
}

export async function userHasRole({playerId, role}: {playerId: string, role: AuthRole}): Promise<boolean> {
    const foundRole = await authRoleRepository.getPlayerRole({player_id: playerId, role});

    return !!foundRole;
}

export async function clearAllAuthRoles() {
    disallowInProduction();
    await authRoleRepository.deleteAll();
}