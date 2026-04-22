import { Prisma } from '@prisma/client';

export const transportTycoonScenarios: Omit<Prisma.ScenarioCreateInput, 'game'>[] = [
    {
        title: 'small island', description: '',
        mongo_state_id: 'dummyvalue',
    }
]