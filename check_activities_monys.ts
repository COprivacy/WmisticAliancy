import { db } from "./server/db";
import { activities } from "./shared/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const allActivities = await db.select().from(activities).where(
        ilike(activities.playerGameName, "%Monys%")
    );

    console.log("ACTIVITIES FOUND:");
    for (const a of allActivities) {
        console.log({
            id: a.id,
            playerId: a.playerId,
            playerGameName: a.playerGameName,
            type: a.type,
            data: a.data
        });
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
