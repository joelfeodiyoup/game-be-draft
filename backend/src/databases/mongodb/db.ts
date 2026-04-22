import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017';
const DB_NAME = 'gamedb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
    if (db) return db;

    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);

    console.log('MongoDB connected');
    return db;
}

export async function getMongoDb(): Promise<Db> {
    if (!db) {
        return await connectMongo();
    }
    return db;
}

export async function disconnectMongo(): Promise<void> {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}