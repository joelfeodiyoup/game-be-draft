import { PrismaClient } from '@prisma/client';
import { traceOperation } from 'common/tracing-helpers';
import { TxClient } from 'common/transaction.types';

const prismaClientSingleton = () => {
    const client = new PrismaClient({
        // log: process.env.ENABLE_TRACING === 'true' ? ['query'] : [],
    });

    return client;
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare const globalThis: {
    prisma: PrismaClientSingleton | undefined;
} & typeof global;

let prisma: PrismaClientSingleton | undefined;

export function initializePrisma() {
    console.log('initializing prisma');
    if (!prisma) {
        prisma = globalThis.prisma ?? prismaClientSingleton();
        if (process.env.NODE_ENV !== 'production') {
            globalThis.prisma = prisma;
        }
        process.on('SIGINT', async () => {
            await disconnectPrisma();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await disconnectPrisma();
            process.exit(0);
        });
    }

    return prisma;
}

export function prismaTransaction<T>(fn: (tx: TxClient) => Promise<T>) {
    if (!prisma) {
        throw new Error('Prisma client not initialized. Call initializePrisma() first.');
    }

    return traceOperation(
        'prisma.transaction',
        async () => prisma!.$transaction(async tx => fn(tx)),
        {
            'db.system': 'postgresql',
            'db.operation': 'transaction',
        }
    )
}

export function disconnectPrisma() {
    if (prisma) {
        return prisma.$disconnect();
    }
}