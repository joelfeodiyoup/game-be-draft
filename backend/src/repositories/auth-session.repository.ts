import { Prisma } from '@prisma/client';

export const createAuthSessionRepository = (prisma: Prisma.TransactionClient) => ({
    async create(data: Prisma.AuthSessionCreateInput) {
        return prisma.authSession.create({data});
    },
    async update({data, where}: {data: Prisma.AuthSessionUpdateInput, where: Pick<Prisma.AuthSessionWhereUniqueInput, 'id'>}) {
        return prisma.authSession.update({data, where })
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
})