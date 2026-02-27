
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function migrate() {
    console.log("Adding last_claimed_at column...");
    try {
        await db.run(sql`ALTER TABLE players ADD COLUMN last_claimed_at INTEGER`);
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed (column might already exist):", err);
    }
}

migrate();
