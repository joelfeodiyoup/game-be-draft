import { Prisma } from '@prisma/client';

export const createScenarioSaveRepository = (prisma: Prisma.TransactionClient) => ({
    async create({stateId, playerId, scenarioId}: {stateId: string, playerId: string, scenarioId: string}) {
        const data: Prisma.ScenarioSaveCreateInput = {
            mongodb_state_id: stateId,
            time_played_in_seconds: 0,
            player: {
                connect: { id: playerId }
            },
            scenario: {
                connect: { id: scenarioId }
            }
        }
        const scenarioSave = await prisma.scenarioSave.create({data});

        return scenarioSave;
    },
    async getPlayerSaves({wherePlayer}: {wherePlayer: Pick<Prisma.ScenarioSaveWhereInput, 'player_id'>}) {
        const playerSaves = await prisma.scenarioSave.findMany({where: wherePlayer});

        return playerSaves;
    },
    async getSaveById({whereId}: {whereId: Prisma.ScenarioSaveWhereInput}) {
        const gameSave = await prisma.scenarioSave.findFirst({where: whereId});

        return gameSave;
    }
})