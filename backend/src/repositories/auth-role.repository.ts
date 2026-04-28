import { disallowInProduction } from '@/utils/environment-guards';
import { Prisma } from '@prisma/client';

export const createAuthRoleRepository = (client: Prisma.TransactionClient) => ({
    async create(data: Prisma.AuthRoleCreateInput) {
        return client.authRole.create({data});
    },
    async removeRole(where: Pick<Prisma.AuthRoleWhereUniqueInput, 'player_id_role'>) {
        return client.authRole.delete({where});
    },
    async getPlayerRoles(playerId: Pick<Prisma.AuthRoleWhereInput, 'player_id'>) {
        return client.authRole.findMany({where: playerId});
    },
    async getPlayerRole(where: Pick<Prisma.AuthRoleWhereInput, 'role' | 'player_id'>) {
        return client.authRole.findFirst({where});
    },
    async deleteAll() {
        disallowInProduction();
        return client.authRole.deleteMany();
    }
})