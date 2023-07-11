import { MongoClient, Db } from "mongodb";
let db: Db;
export async function connectToDatabase() {
  const client: MongoClient = new MongoClient(
    "mongodb://127.0.0.1:27017/web-chat"
  );
  await client.connect();
  console.log("seccessfulu connect to db");
  db = client.db();
}

export function getDB(): Db {
  return db;
}
