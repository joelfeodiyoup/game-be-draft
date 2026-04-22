import { ObjectId } from "mongodb";
import { connectMongo } from "../../../databases/mongodb/db"
import { disallowInProduction } from "@/utils/environment-guards";

const collectionName = 'scenario_state';

export const scenarioStateRepository = {
    async deleteAll() {
        disallowInProduction();

        const db = await connectMongo();
        return await db.collection(collectionName).deleteMany();
    },
    async create({scenarioState}: {scenarioState: any}): Promise<{id: string}> {
        const db = await connectMongo();
        const record = await db.collection(collectionName).insertOne(scenarioState);
        return {id: record.insertedId.toString()};
    },
    async getById({id}: {id: string}) {
        const db = await connectMongo();
        const record = await db.collection(collectionName).findOne({
            _id: new ObjectId(id),
        });
        return record;
    }
}