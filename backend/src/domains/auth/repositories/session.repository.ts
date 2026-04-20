import prisma from '../../../databases/postgres/db';
import { Prisma } from '@prisma/client';

export const sessionRepository = {
    async create(data: Prisma.SessionCreateInput) {
        return prisma.session.create({data});
    },
    async findById(whereId: Pick<Prisma.SessionWhereUniqueInput, 'id'>) {
        return prisma.session.findFirst({where: whereId});
    },
    async findByPlayerId(wherePlayer: Pick<Prisma.SessionWhereUniqueInput, 'player_id'>) {
        return prisma.session.findFirst({where: wherePlayer});
    },
    async delete(whereId: Pick<Prisma.SessionWhereUniqueInput, 'id'>) {
        return prisma.session.delete({where: whereId});
    },
    // async deleteExpired(now: Date) {
    //     // const expiredSessions = await prisma.session.findMany({where: {expires_at}})
    //     return prisma.session.deleteMany()
    // }
}