import { disallowInProduction } from '@/utils/environment-guards';
import { Prisma } from '@prisma/client';

export const createPlayerRepository = (prisma: Prisma.TransactionClient) => ({
    async create(data: Prisma.PlayerCreateInput) {
        return await prisma.player.create({data})
    },
    async findByUsername(whereUsername: Required<Pick<Prisma.PlayerWhereUniqueInput, 'username'>>) {
        return await prisma.player.findFirst({where: whereUsername});
    },
    // findByUsername, findById, updatePassword, ...
    async deleteAll() {
        disallowInProduction();
        return await prisma.player.deleteMany();
    }
})