import prisma from '../databases/postgres/db';
import { Prisma } from '@prisma/client';

export const authSessionRepository = {
    async create(data: Prisma.AuthSessionCreateInput) {
        return prisma.authSession.create({data});
    },
    async findById(whereId: Pick<Prisma.AuthSessionWhereUniqueInput, 'id'>) {
        return prisma.authSession.findFirst({where: whereId});
    },
    async findByPlayerId(wherePlayer: Pick<Prisma.AuthSessionWhereUniqueInput, 'player_id'>) {
        return prisma.authSession.findFirst({where: wherePlayer});
    },
    async delete(whereId: Pick<Prisma.AuthSessionWhereUniqueInput, 'id'>) {
        return prisma.authSession.delete({where: whereId});
    },
    // async deleteExpired(now: Date) {
    //     // const expiredSessions = await prisma.session.findMany({where: {expires_at}})
    //     return prisma.session.deleteMany()
    // }
}