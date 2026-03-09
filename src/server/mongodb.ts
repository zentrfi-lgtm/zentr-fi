import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("[mongodb] MONGODB_URI not set — trip history will be unavailable.");
}

let cached: { client: MongoClient; db: Db } | null = null;

/**
 * Returns a cached MongoDB client + db instance.
 * Re-uses the same connection across hot-reloads in dev.
 */
export async function getDb(): Promise<Db> {
  if (cached) return cached.db;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(); // uses DB name from the URI
  cached = { client, db };
  return db;
}
