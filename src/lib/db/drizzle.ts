import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.NEXT_PUBLIC_DATABASE_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

// const sql = (process.env.NEXT_PUBLIC_DATABASE_URL!);
export const db = drizzle(process.env.NEXT_PUBLIC_DATABASE_URL);
