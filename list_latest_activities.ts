import { db } from "./server/db";
import { activities } from "./shared/schema";
import { sql } from "drizzle-orm";

async function main() {
    const latestActivities = await db.select().from(activities).orderBy(sql`${activities.id} DESC`).limit(20);

    console.log("LATEST ACTIVITIES:");
    for (const a of latestActivities) {
        console.log(`ID: ${a.id}, PlayerID: ${a.playerId}, Name: ${a.playerGameName}, Type: ${a.type}`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
