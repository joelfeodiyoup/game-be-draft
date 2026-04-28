import { Prisma } from '@prisma/client';

// Type for transaction client
export type TxClient = Prisma.TransactionClient;

export type Orchestrator<TArgs, TReturn> = (args: TArgs) => Promise<TReturn>;
export type Worker<TArgs, TReturn> =  (tx: TxClient, args: TArgs) => Promise<TReturn>;
