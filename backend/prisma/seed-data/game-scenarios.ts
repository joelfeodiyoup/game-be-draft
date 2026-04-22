import { Prisma } from '@prisma/client';

export const transportTycoonScenarios: (Pick<Prisma.ScenarioCreateInput, 'title' | 'description'> & {scenarioState: any})[] = [
    {
        title: 'small island', description: 'A very small island poses some space challenges', scenarioState: { size: 1}
    },
    {
        title: 'no money', description: 'In this scenario you start with no money', scenarioState: { money: 0}
    },
    {
        title: 'futuristic', description: 'Start in the distant future', scenarioState: { year: 3000, money: '10 billion dollars'}
    }
]