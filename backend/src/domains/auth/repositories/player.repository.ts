import prisma from '../../../databases/postgres/db';
import { Prisma } from '@prisma/client';

export const playerRepository = {
    async create(data: Prisma.PlayerCreateInput) {
        return prisma.player.create({data})
    },
    async findByUsername(whereUsername: Required<Pick<Prisma.PlayerWhereUniqueInput, 'username'>>) {
        return prisma.player.findFirst({where: whereUsername});
    }
    // findByUsername, findById, updatePassword, ...
}