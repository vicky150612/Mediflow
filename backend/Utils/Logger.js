import { connectDB } from "../db.js";

export const Logger = async (message) => {
    const db = await connectDB();
    const collection = db.collection("logs");
    const result = await collection.insertOne({
        message,
        timestamp: new Date(),
    });
    return result;
};
