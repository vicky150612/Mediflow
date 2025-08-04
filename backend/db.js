import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) { throw new Error("MONGODB_URI not set in .env") };

const client = new MongoClient(uri);
let db;

export async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db("Mediflow");
    }
    return db;
}