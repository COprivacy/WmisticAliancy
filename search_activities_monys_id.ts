import { db } from "./server/db";
import { activities } from "./shared/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const monysActs = await db.select().from(activities).where(
        ilike(activities.data, "%1432804059%")
    );

    console.log("ACTIVITIES WITH DATA FOR MONYS ID:");
    for (const a of monysActs) {
        console.log(`ID: ${a.id}, PlayerID: ${a.playerId}, Name: ${a.playerGameName}, Type: ${a.type}, Data: ${a.data}`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
