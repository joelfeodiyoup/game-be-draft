import { ObjectId } from "mongodb";
import { connectMongo } from "../databases/mongodb/db"

const collectionName = 'game_saves';

export const gameStateRepository = {
    async create({gameState}: {gameState: any}): Promise<{id: string}> {
        const db = await connectMongo();
        const record = await db.collection(collectionName).insertOne(gameState);
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