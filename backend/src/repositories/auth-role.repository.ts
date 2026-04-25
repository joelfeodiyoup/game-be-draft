import { disallowInProduction } from '@/utils/environment-guards';
import prisma from '../databases/postgres/db';
import { Prisma } from '@prisma/client';

export const authRoleRepository = {
    async create(data: Prisma.AuthRoleCreateInput) {
        return prisma.authRole.create({data});
    },
    async removeRole(where: Pick<Prisma.AuthRoleWhereUniqueInput, 'player_id_role'>) {
        return prisma.authRole.delete({where});
    },
    async getPlayerRoles(playerId: Pick<Prisma.AuthRoleWhereInput, 'player_id'>) {
        return prisma.authRole.findMany({where: playerId});
    },
    async getPlayerRole(where: Pick<Prisma.AuthRoleWhereInput, 'role' | 'player_id'>) {
        return prisma.authRole.findFirst({where});
    },
    async deleteAll() {
        disallowInProduction();
        return prisma.authRole.deleteMany();
    }
}