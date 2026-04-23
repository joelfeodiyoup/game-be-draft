import { Prisma } from "@prisma/client";
import prisma from '../databases/postgres/db';
import { disallowInProduction } from "@/utils/environment-guards";

export const scenarioRepository = {
    async findById({whereScenario}: {whereScenario: Pick<Prisma.ScenarioWhereInput, 'id'>}) {
        return prisma.scenario.findFirst({where: whereScenario});
    },
    async findByGameId(whereGameIdId: Pick<Prisma.ScenarioWhereInput, 'game_id'>) {
        return prisma.scenario.findMany({where: whereGameIdId});
    },
    async create({data}: {data: Prisma.ScenarioCreateInput}) {
        return prisma.scenario.create({data});
    },
    async deleteAll() {
        disallowInProduction();

        return prisma.scenario.deleteMany();
    }
}